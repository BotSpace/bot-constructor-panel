// ---------------------------------------------------------------------------
// Credential feature — shared TypeScript types
// ---------------------------------------------------------------------------

export type CredentialFieldType = "text" | "password" | "number" | "select" | "textarea";
export type CredentialMode = "apikey" | "bearer" | "header" | "basic" | "none" | "oauth2";

export interface CredentialFieldOption {
  value: string;
  label: string;
}

export interface CredentialFieldDef {
  name: string;
  label: string;
  type: CredentialFieldType;
  secret?: boolean;
  required?: boolean;
  default?: string | number;
  options?: CredentialFieldOption[];
}

export interface CredentialType {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  mode: CredentialMode;
  fields: CredentialFieldDef[];
  system?: boolean;
  owner?: number | null;
  /** OAuth2-only: provider key (e.g. "google") */
  provider?: string;
  /** OAuth2-only: requested scopes */
  scopes?: string[];
}

// List / detail: secret fields are masked as "••••last4" or null
export interface CredentialListItem {
  id: number;
  name: string;
  type_key: string;
  type: Pick<CredentialType, "key" | "label" | "icon" | "mode">;
  updated_at: string;
  data: Record<string, string | null>;
}

export interface CredentialDetail extends CredentialListItem {
  // same shape; backend returns full item
}

// Paginated list response from backend
export interface CredentialListResponse {
  results: CredentialListItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CredentialTypesResponse {
  results: CredentialType[];
  count: number;
}

// Request bodies
export interface CreateCredentialPayload {
  name: string;
  type_key: string;
  data: Record<string, string | number>;
}

export interface PatchCredentialPayload {
  name?: string;
  data?: Record<string, string | number>;
}

