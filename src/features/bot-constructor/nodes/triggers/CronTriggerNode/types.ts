export interface CronTriggerNodeData {
  schedule: string; // "0 9 * * *";
  enabled: boolean;
  targetChatIds: number[];
}
