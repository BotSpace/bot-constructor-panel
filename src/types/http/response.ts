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
