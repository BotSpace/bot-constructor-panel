"use client";

/**
 * WsHub — frontenddagi YAGONA WebSocket ulanish markazi.
 *
 * Dizayn:
 *  - Bitta ulanishni saqlaydi, hamma joy `subscribe()` orqali ishlatadi.
 *  - Har 1s da yengil watchdog (faqat readyState/timestamp solishtirish —
 *    nagruzka yo'q): uzilgan bo'lsa qayta ulaydi, HECH QACHON taslim bo'lmaydi
 *    (eski provider 10 urinishdan keyin butunlay to'xtab qolardi).
 *  - Liveness: trafik bo'lmasa app-level ping yuboradi — ws-server (gorilla)
 *    kelgan xabarni room'ga qaytarib broadcast qiladi, shu echo round-trip
 *    isboti bo'lib xizmat qiladi. Echo kelmasa ulanish o'lik deb topilib
 *    qayta ulanadi (yarim-ochiq TCP holatlarini ham tutadi).
 *  - Token har (qayta)ulanishda yangidan olinadi (tokenProvider) — eskirgan
 *    token bilan ulanishga urinaverish muammosi yo'q.
 *  - `online` va `visibilitychange` hodisalarida darhol tekshiradi.
 */

export type WsListener = (
  event: string,
  data: Record<string, unknown>
) => void;

type TokenProvider = () => Promise<string | null | undefined>;

const WATCHDOG_INTERVAL_MS = 500; // arzon tekshiruv (readyState + timestamp), tarmoq yo'q
/** Shu muddat trafik bo'lmasa ping yuboramiz. */
const IDLE_PING_AFTER_MS = 25_000;
/** Ping'dan keyin shu muddat ichida echo/xabar kelmasa — ulanish o'lik. */
const PING_TIMEOUT_MS = 10_000;
/** CONNECTING holatida shu muddatdan uzoq qotib qolsa — uzib qayta ulaymiz. */
const CONNECT_TIMEOUT_MS = 10_000;
/** Qayta ulanish backoff'i: 500ms * 2^n, maksimum 5s. Cheksiz urinadi. */
const BACKOFF_BASE_MS = 500;
const BACKOFF_MAX_MS = 5_000;

// Derived from NEXT_PUBLIC_API so local/staging/prod all point at their own
// backend. Go backend mounts the socket at GET /api/v1/ws (see
// internal/modules/ws/routes.go) — NOT /ws/events.
//
// IMPORTANT (see report): the Go backend's /ws is currently a generic
// room-based chat scaffold ({type, from, room, body}); it does not emit the
// domain events this hub expects ("release_status", "debug_status",
// "context", "node_execution", "error" as {event, data}). Connecting here
// will succeed but no real-time debug/release updates will arrive until the
// backend adds that broadcasting.
function resolveWsUrl(): string {
  const api = process.env.NEXT_PUBLIC_API || "";
  // Real-time WS is a SEPARATE service (`websocket`, gateway PathPrefix /ws ->
  // websocket:8080, endpoint /ws/events) — NOT the Go backend. It must NOT use
  // the /api/v2 prefix (that routes to backend-golang's unused ws module). Same
  // host as the API, fixed /ws/events path. The service validates ?token= with
  // jwt-secret's key and reads the project_id claim (collab-token) to pick the room.
  try {
    const u = new URL(api);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "/ws/events";
    u.search = "";
    return u.toString();
  } catch {
    return "wss://api.botspace.uz/ws/events";
  }
}

export const WS_URL = resolveWsUrl();

class WsHub {
  private ws: WebSocket | null = null;
  private listeners = new Set<WsListener>();
  private tokenProvider: TokenProvider | null = null;

  private watchdog: ReturnType<typeof setInterval> | null = null;
  private connecting = false;
  private connectStartedAt = 0;
  private lastActivityAt = 0;
  private lastPingAt = 0;
  private attempt = 0;
  private backoffUntil = 0;

  /** Hub'ni ishga tushiradi (idempotent). tokenProvider har ulanishda chaqiriladi. */
  start(tokenProvider: TokenProvider) {
    this.tokenProvider = tokenProvider;
    if (this.watchdog) return;
    this.watchdog = setInterval(() => void this.ensure(), WATCHDOG_INTERVAL_MS);
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.kick);
      document.addEventListener("visibilitychange", this.onVisibility);
    }
    void this.ensure();
  }

  /** Hub'ni to'liq to'xtatadi (logout/unmount). */
  stop() {
    if (this.watchdog) {
      clearInterval(this.watchdog);
      this.watchdog = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.kick);
      document.removeEventListener("visibilitychange", this.onVisibility);
    }
    this.teardownSocket();
    this.tokenProvider = null;
    this.attempt = 0;
    this.backoffUntil = 0;
  }

  /** Event listener qo'shadi; qaytgan funksiya obunani bekor qiladi. */
  subscribe(fn: WsListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ── ichki ────────────────────────────────────────────────────────────────

  private kick = () => {
    // Tashqi signal (online/visible) — backoff'ni kutmasdan darhol urinish.
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
      // Handlerlarni bo'shatamiz — eski socket onclose'i yangi holatni buzmasin.
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      try {
        ws.close();
      } catch {
        /* allaqachon yopiq */
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

  /** Watchdog tanasi — har tick'da arzon tekshiruvlar. */
  private async ensure() {
    if (!this.tokenProvider) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    const now = Date.now();
    const state = this.ws?.readyState;

    if (state === WebSocket.OPEN) {
      // Liveness: uzoq jim tursa ping; echo kelmasa — o'lik, qayta ulaymiz.
      if (this.lastPingAt && now - this.lastPingAt > PING_TIMEOUT_MS) {
        this.teardownSocket();
        this.scheduleBackoff();
        return;
      }
      if (!this.lastPingAt && now - this.lastActivityAt > IDLE_PING_AFTER_MS) {
        try {
          this.ws!.send(JSON.stringify({ event: "client_ping", ts: now }));
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

    // Yopiq/yo'q — backoff tugagan bo'lsa qayta ulanamiz.
    if (this.connecting || now < this.backoffUntil) return;
    this.connecting = true;
    this.connectStartedAt = now;

    let token: string | null | undefined;
    try {
      token = await this.tokenProvider();
    } catch {
      token = null;
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
      this.lastPingAt = 0; // har qanday kelgan xabar liveness isboti

      let parsed: { event?: string; data?: Record<string, unknown> };
      try {
        parsed = JSON.parse(msg.data);
      } catch {
        return;
      }
      const event = parsed.event;
      if (!event || event === "client_ping") return; // o'z echo'miz
      const data = (parsed.data ?? {}) as Record<string, unknown>;
      for (const fn of this.listeners) {
        try {
          fn(event, data);
        } catch {
          /* bitta listener xatosi boshqalarini to'xtatmasin */
        }
      }
    };

    ws.onerror = () => {
      /* onclose baribir keladi — u yerda hal qilamiz */
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

/** Global singleton — butun frontend shu bitta hub'ni ishlatadi. */
export const wsHub = new WsHub();
