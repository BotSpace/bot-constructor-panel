export interface APIListResponse<T> {
  status: boolean;
  data: {
    links: Links;
    total_items: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    results: T;
  };
}

export interface APIDetailCreateResponse<T> {
  status: boolean;
  data: T;
}

/**
 * New Go backend (api/v1) list envelope. Every list endpoint
 * (projects, credentials, cms collections, modules, ...) returns this raw
 * shape — no `{status, data}` wrapper, offset/limit pagination instead of
 * page/page_size.
 */
export interface ListEnvelope<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * New Go backend error body: `{ error: { code, message, details } }`.
 * Replaces the old DRF-style `{status:false, data:{detail}}` / flat
 * `{message, code}` shapes.
 */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface Links {
  previous: string | null;
  next: string | null;
}

export interface ScrollAPIResponse<T> {
  data: {
    links: {
      previous?: string;
      next?: string;
    };
    total_items: number;
    total_pages: number;
    page_size: number;
    current_page: number;
    results: T;
  };
  status: boolean;
}
