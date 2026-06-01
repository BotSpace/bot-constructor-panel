// Shared types for trigger state configuration

export type StateType =
  // Message data
  | "text"
  | "caption"
  // Callback data
  | "callback"
  | "data"
  | "collection_id"
  | "full_data"
  // File data
  | "file_id"
  // Contact data
  | "phone_number"
  | "contact_phone_number"
  | "contact_first_name"
  | "contact_last_name"
  // Location data
  | "location"
  | "latitude"
  | "longitude"
  | "location_latitude"
  | "location_longitude"
  // Custom — engine reads data.customType when type === "Custom"
  | "Custom";

export interface StateConfig {
  key: string;
  type: StateType;
  /** Only used when type === "Custom". Engine reads this as the actual state type. */
  customType?: string;
}
