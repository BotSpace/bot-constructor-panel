export interface APIResponseType<T> {
  status: boolean;
  data: T;
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
