export interface Project {
  id: number;
  name: string;
  debug: {
    id: number;
    status: "running" | "stopped" | "initializing" | "loading";
    service_id: string;
  };
  flow: {
    edges: [];
    nodes: [];
  };
}
