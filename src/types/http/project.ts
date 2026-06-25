import type { Edge, Node } from "reactflow";

export type Status =
  | "pending"
  | "initializing"
  | "running"
  | "stopped"
  | "stopping"
  | "failed"
  | "suspended";

export interface ProjectRetrive {
  id: number;
  name: string;
  users: number;
  username: string | null;
  avatar: string | null;
  debug: {
    created_at: Date;
    updated_at: Date;
    id: number;
    status: Status;
    service_id: string | null;
  };
  debug_uuid: string;
  release: {
    id: number;
    version: number;
    status: Status;
    service_id: string;
  } | null;
  debug_bot: boolean;
  release_bot: boolean;
  flow: {
    edges: Edge[];
    nodes: Node[];
    languages?: string[];
    defaultLanguage?: string;
  };
  /** Compressed flow: base64(gzip(JSON.stringify(flow))). Present when ?compress=1 used. */
  flow_gz?: string;
}
