import type { DebugInfo, ProjectRetrive, ReleaseInfo, Status } from "@/types/http/project";

const statuses = new Set<Status>([
  "pending", "initializing", "running", "stopped", "stopping", "failed", "suspended",
]);

export function isOlderStatus(current: { updated_at: string }, next: { updated_at?: string }) {
  const previous = Date.parse(current.updated_at);
  const incoming = Date.parse(next.updated_at ?? "");
  return Number.isFinite(previous) && Number.isFinite(incoming) && incoming < previous;
}

export function acceptRelease(current: ReleaseInfo | null, next: ReleaseInfo | null) {
  if (!current || !next) return true;
  if (next.version !== current.version) return next.version > current.version;
  return !isOlderStatus(current, next);
}

/** WS payloads are partial records, not REST DTOs. Never invent a timestamp. */
export function statusEvent(project: ProjectRetrive, event: string, data: Record<string, unknown>) {
  if (String(data.project) !== String(project.id) || !statuses.has(data.status as Status)) return null;
  const common = {
    project_id: project.id,
    status: data.status as Status,
    ...(typeof data.updated_at === "string" ? { updated_at: data.updated_at } : {}),
    ...(typeof data.service_id === "string" || data.service_id === null
      ? { service_id: data.service_id ?? undefined } : {}),
  };
  if (event === "release_status") {
    const version = Number(data.version);
    if (!Number.isInteger(version) || version < 1) return null;
    const previous = project.release?.version === version ? project.release : null;
    const release: ReleaseInfo = {
      id: "", created_at: "", updated_at: "", ...previous, ...common, version,
    };
    return acceptRelease(project.release, release) ? { release } : null;
  }
  if (event === "debug_status") {
    if (isOlderStatus(project.debug, common)) return null;
    return { debug: { ...project.debug, ...common } };
  }
  return null;
}

export type StatusSnapshot = { release?: ReleaseInfo | null; debug?: DebugInfo };

type ReconcilePorts = {
  current: () => ProjectRetrive | null;
  isOpen: () => boolean;
  fetch: (id: string, signal: AbortSignal) => Promise<StatusSnapshot>;
  apply: (snapshot: StatusSnapshot) => void;
};

/** One request batch per active scope, with at most one trailing reconnect batch. */
export function createStatusReconciler(ports: ReconcilePorts) {
  let disposed = false;
  let projectId: string | null = null;
  let generation = 0;
  let active: AbortController | null = null;
  let queued = false;

  function syncProject() {
    const id = ports.current()?.id ?? null;
    if (id === projectId) return false;
    projectId = id;
    generation++;
    active?.abort();
    active = null;
    queued = false;
    return true;
  }

  function request() {
    if (disposed) return;
    syncProject();
    const before = ports.current();
    if (!before || !ports.isOpen()) return;
    if (active) { queued = true; return; }
    const controller = new AbortController();
    active = controller;
    const scope = generation;
    void ports.fetch(before.id, controller.signal).then((snapshot) => {
      const current = ports.current();
      if (disposed || controller.signal.aborted || scope !== generation || current?.id !== before.id) return;
      // Each stream has its own guard: a live debug update needn't discard release catch-up.
      const patch: StatusSnapshot = {};
      if (current.release === before.release && snapshot.release !== undefined) patch.release = snapshot.release;
      if (current.debug === before.debug && snapshot.debug !== undefined) patch.debug = snapshot.debug;
      ports.apply(patch);
    }).catch(() => {
      // Keep last known state on transport/auth errors. Retry only on the next open/project change.
    }).finally(() => {
      if (active !== controller) return;
      active = null;
      if (queued) { queued = false; request(); }
    });
  }

  return {
    opened: request,
    projectChanged() {
      if (!disposed && syncProject()) request();
    },
    dispose() {
      disposed = true;
      generation++;
      active?.abort();
      active = null;
      queued = false;
    },
  };
}
