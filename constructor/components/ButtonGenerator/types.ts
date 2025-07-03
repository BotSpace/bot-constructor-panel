// Tugma konfiguratsiyasi uchun interfeys
export interface ButtonConfig {
  id: string;
  text: string;
  type: "url" | "callback" | "reply" | "request_contact" | "request_location";
  value?: string;
}
