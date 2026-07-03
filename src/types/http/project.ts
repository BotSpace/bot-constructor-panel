import type { Edge, Node } from "reactflow";

export type Status =
  | "pending"
  | "initializing"
  | "running"
  | "stopped"
  | "stopping"
  | "failed"
  | "suspended";

/**
 * Raw project projection returned by the Go backend
 * (`GET/POST/PATCH /api/v1/projects[/:id]`). Deliberately lean — release and
 * debug status are NOT embedded (those live in the /relase and
 * /projects/:id/info endpoints); the constructor store merges them in after
 * loading the project (see store/project.ts).
 */
export interface ProjectResponse {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  username?: string;
  owner_id: string;
  /** Raw JSON — either `{nodes,edges,languages,defaultLanguage}` or `[]` for a brand-new project. */
  flow: unknown;
  is_template: boolean;
  release_webhook_uuid: string;
  debug_webhook_uuid: string;
  created_at: string;
  updated_at: string;
}

export interface DebugInfo {
  id: string;
  project_id: string;
  status: Status;
  flow_hash?: string;
  service_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReleaseInfo {
  id: string;
  project_id: string;
  version: number;
  status: Status;
  service_id?: string;
  flow?: unknown;
  created_at: string;
  updated_at: string;
}

/**
 * Client-side composite the constructor store builds after loading a
 * project: the raw ProjectResponse plus the latest release/debug records
 * (fetched separately) merged in, so the rest of the UI (debug.tsx,
 * relas.tsx, ...) can keep reading `project.debug` / `project.release`
 * exactly like it did against the old Django backend's embedded fields.
 */
export interface ProjectRetrive extends Omit<ProjectResponse, "flow" | "username"> {
  /** New-backend id is already a string uuid; kept for API compat with old numeric-id call sites. */
  id: string;
  username: string | null;
  debug: DebugInfo;
  debug_uuid: string;
  release: ReleaseInfo | null;
  /** Derived from environment: a RELEASE_BOT_TOKEN env var exists for this project. */
  release_bot: boolean;
  /** Derived from environment: a DEBUG_BOT_TOKEN env var exists for this project. */
  debug_bot: boolean;
  flow: {
    edges: Edge[];
    nodes: Node[];
    languages?: string[];
    defaultLanguage?: string;
  };
}
