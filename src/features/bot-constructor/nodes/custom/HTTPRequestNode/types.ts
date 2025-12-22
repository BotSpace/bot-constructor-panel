export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HTTPRequestNodeData {
  method?: HTTPMethod;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  responseVariable?: string;
  timeout?: number;
  storeHeaders?: boolean;
}
