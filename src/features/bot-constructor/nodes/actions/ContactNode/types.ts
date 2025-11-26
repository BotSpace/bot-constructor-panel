export interface SendContactNodeData {
  recipients?: {
    sendToSender: boolean;
    additionalIds: string[];
  };
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  vcard?: string;
}
