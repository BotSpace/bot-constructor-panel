export interface ProjectRetrive {
  id: number;
  name: string;
  debug: {
    id: 14;
    status: string;
    service_id: null;
  };
  release: {
    id: number;
    version: number;
    status: "running";
    service_id: string;
  } | null;
  debug_bot: false;
  release_bot: false;
  flow: {
    nodes: any[];
    edges: any[];
  };
}
