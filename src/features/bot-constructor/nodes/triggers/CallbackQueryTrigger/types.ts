export interface CallbackQueryTriggerData {
  filter: string;
  global: boolean;
  context: {
    value: string;
  };
}
