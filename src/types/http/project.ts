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
    id: number;
    status: Status;
    service_id: string | null;
  };
  release: {
    id: number;
    version: number;
    status: Status;
    service_id: string;
  } | null;
  debug_bot: boolean;
  release_bot: boolean;
  flow: {
    edges: [];
    nodes: [];
  };
}
