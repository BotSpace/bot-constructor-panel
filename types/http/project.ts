export interface ProjectRetrive {
  id: number;
  name: string;
  debug: {
    id: 14;
    status:
      | "pending"
      | "initializing"
      | "running"
      | "stopped"
      | "stopping"
      | "failed"
      | "suspended";

    service_id: null;
  };
  release: {
    id: number;
    version: number;
    status: "running";
    service_id: string;
  } | null;
  debug_bot: boolean;
  release_bot: boolean;
  flow: {
    nodes: [];
    edges: [];
  };
}
