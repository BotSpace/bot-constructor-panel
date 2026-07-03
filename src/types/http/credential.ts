// ---------------------------------------------------------------------------
// Credential feature — shared TypeScript types
// ---------------------------------------------------------------------------

export type CredentialFieldType = "text" | "password" | "number" | "select" | "textarea" | "url" | "switch";
export type CredentialMode = "apikey" | "bearer" | "header" | "basic" | "none" | "oauth2";
export type CredentialSource = "system" | "admin" | "module";

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
  /** Brand color (hex) for the icon */
  color?: string;
  mode: CredentialMode;
  fields: CredentialFieldDef[];
  system?: boolean;
  owner?: number | null;
  /** OAuth2-only: provider key (e.g. "google") */
  provider?: string;
  /** OAuth2-only: requested scopes */
  scopes?: string[];
  /** Where the type comes from: system code, admin UI, or external module */
  source?: CredentialSource;
  /** Whether the type definition is editable in admin */
  editable?: boolean;
}

// List / detail: secret fields are masked as "••••last4" or null
export interface CredentialListItem {
  id: string;
  name: string;
  type_key: string;
  type: Pick<CredentialType, "key" | "label" | "icon" | "mode">;
  updated_at: string;
  data: Record<string, string | null>;
}


// Paginated list response from backend


// Request bodies
export interface CreateCredentialPayload {
  name: string;
  type_key: string;
  data: Record<string, string | number | boolean>;
}

export interface PatchCredentialPayload {
  name?: string;
  data?: Record<string, string | number | boolean>;
}

