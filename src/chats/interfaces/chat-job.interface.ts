export interface ChatJobData {
  chatId: string;
  senderId: string;
  content: string;
  participantIds: string[];
  recipientId?: string;
  clientRequestId?: string;
}
