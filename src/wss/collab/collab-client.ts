"use client";

// CollabClient — a SEPARATE WebSocket connection (NOT the shared user-events
// wsHub) dedicated to real-time collaborative editing of a single project.
//
// The collab token carries a `project_id` claim, which makes websocket-golang
// join the `project_<id>` room and relay BINARY frames between editors of the
// SAME project (it never echoes a sender's own frames back). We reuse the
// wsHub reconnect/liveness patterns: a cheap watchdog, exponential backoff,
// idle ping with echo-based liveness, and a fresh token on every (re)connect.
//
// Everything here is best-effort: if the token fetch or the socket fails, the
// editor keeps working normally (autosave is unaffected) — collab just stops.

import { instanceAuth } from "@/services/instance";
import { WS_URL } from "@/wss/ws-hub";
import { decodeOp, encodeOp, type CollabOp } from "./ops";

const WATCHDOG_INTERVAL_MS = 500;
const IDLE_PING_AFTER_MS = 25_000;
const PING_TIMEOUT_MS = 10_000;
const CONNECT_TIMEOUT_MS = 10_000;
const BACKOFF_BASE_MS = 500;
const BACKOFF_MAX_MS = 5_000;

/** Small app-level ping so the room echoes it back as a liveness proof. */
const PING_FRAME = encodeOp({ t: "nd", id: "__collab_ping__" });

interface CollabTokenResponse {
  status: boolean;
  data: { token: string; room: string };
}

export type RemoteOpHandler = (op: CollabOp) => void;

export class CollabClient {
  private ws: WebSocket | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private connecting = false;
  private stopped = false;
  private connectStartedAt = 0;
  private lastActivityAt = 0;
  private lastPingAt = 0;
  private attempt = 0;
  private backoffUntil = 0;

  constructor(
    private readonly projectId: string,
    private readonly onRemoteOp: RemoteOpHandler
  ) {}

  /** Begin connecting + maintaining the collab socket (idempotent). */
  start() {
    if (this.watchdog) return;
    this.stopped = false;
    this.watchdog = setInterval(
      () => void this.ensure(),
      WATCHDOG_INTERVAL_MS
    );
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.kick);
      document.addEventListener("visibilitychange", this.onVisibility);
    }
    void this.ensure();
  }

  /** Fully tear down the collab socket (editor unmount). */
  stop() {
    this.stopped = true;
    if (this.watchdog) {
      clearInterval(this.watchdog);
      this.watchdog = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.kick);
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.teardownSocket();
    this.attempt = 0;
    this.backoffUntil = 0;
  }

  /** Broadcast a LOCAL op to the project room as a binary frame. Best-effort.
   *  Returns true if the frame was actually written to an OPEN socket (→ the
   *  server will persist it), false otherwise (socket closed/dead). */
  send(op: CollabOp): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(encodeOp(op));
      return true;
    } catch {
      /* socket died mid-send — watchdog reconnects */
      return false;
    }
  }

  // ── internals ──────────────────────────────────────────────────────────

  private kick = () => {
    this.backoffUntil = 0;
    void this.ensure();
  };

  private onVisibility = () => {
    if (document.visibilityState === "visible") this.kick();
  };

  private teardownSocket() {
    const ws = this.ws;
    this.ws = null;
    this.connecting = false;
    if (ws) {
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      try {
        ws.close();
      } catch {
        /* already closed */
      }
    }
  }

  private scheduleBackoff() {
    const delay = Math.min(
      BACKOFF_BASE_MS * 2 ** Math.min(this.attempt, 8),
      BACKOFF_MAX_MS
    );
    this.attempt += 1;
    this.backoffUntil = Date.now() + delay;
  }

  private async fetchToken(): Promise<string | null> {
    try {
      const { data } = await instanceAuth.get<CollabTokenResponse>(
        `/project/${this.projectId}/collab-token/`
      );
      return data?.data?.token ?? null;
    } catch {
      return null;
    }
  }

  private async ensure() {
    if (this.stopped) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    const now = Date.now();
    const state = this.ws?.readyState;

    if (state === WebSocket.OPEN) {
      if (this.lastPingAt && now - this.lastPingAt > PING_TIMEOUT_MS) {
        this.teardownSocket();
        this.scheduleBackoff();
        return;
      }
      if (!this.lastPingAt && now - this.lastActivityAt > IDLE_PING_AFTER_MS) {
        try {
          this.ws!.send(PING_FRAME);
          this.lastPingAt = now;
        } catch {
          this.teardownSocket();
          this.scheduleBackoff();
        }
      }
      return;
    }

    if (state === WebSocket.CONNECTING) {
      if (now - this.connectStartedAt > CONNECT_TIMEOUT_MS) {
        this.teardownSocket();
        this.scheduleBackoff();
      }
      return;
    }

    if (this.connecting || now < this.backoffUntil) return;
    this.connecting = true;
    this.connectStartedAt = now;

    const token = await this.fetchToken();
    if (this.stopped) {
      this.connecting = false;
      return;
    }
    if (!token) {
      this.connecting = false;
      this.scheduleBackoff();
      return;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(`${WS_URL}?token=${token}`);
    } catch {
      this.connecting = false;
      this.scheduleBackoff();
      return;
    }
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    ws.onopen = () => {
      this.connecting = false;
      this.attempt = 0;
      this.backoffUntil = 0;
      this.lastActivityAt = Date.now();
      this.lastPingAt = 0;
    };

    ws.onmessage = (msg) => {
      this.lastActivityAt = Date.now();
      this.lastPingAt = 0; // any inbound frame proves liveness

      // The hub may relay JSON control frames too; collab only cares about
      // binary op frames. Ignore anything that isn't a binary payload.
      const payload = msg.data;
      if (typeof payload === "string") return;

      let op: CollabOp;
      try {
        op = decodeOp(payload as ArrayBuffer);
      } catch {
        return; // malformed / non-collab frame — ignore
      }
      // Ignore our own liveness ping should it ever round-trip.
      if (op.t === "nd" && op.id === "__collab_ping__") return;
      try {
        this.onRemoteOp(op);
      } catch {
        /* one bad apply must not kill the connection */
      }
    };

    ws.onerror = () => {
      /* onclose follows — handled there */
    };

    ws.onclose = () => {
      if (this.ws === ws) {
        this.ws = null;
        this.connecting = false;
        this.scheduleBackoff();
      }
    };
  }
}
