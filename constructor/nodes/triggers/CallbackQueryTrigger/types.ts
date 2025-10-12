export interface CallbackQueryTriggerData {
  filter: string;
  context: {
    global: boolean;
    value: string;
  };
}
