export interface SendLocationNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  latitude?: number;
  longitude?: number;
  livePeriod?: number;
  heading?: number;
  horizontalAccuracy?: number;
  proximityAlertRadius?: number;
}
