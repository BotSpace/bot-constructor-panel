export interface ErrorConfig {
  transitional: {
    silentJSONParsing: boolean;
    forcedJSONParsing: boolean;
    clarifyTimeoutError: boolean;
  };
  adapter: string[];
  transformRequest: any[];
  transformResponse: any[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Record<string, any>;
  headers: {
    Accept: string;
    Authorization: string;
  };
  baseURL: string;
  method: string;
  url: string;
  allowAbsoluteUrls: boolean;
}

export interface AxiosError {
  message: string;
  name: string;
  stack: string;
  config: ErrorConfig;
  code: string;
  status: number;
}
