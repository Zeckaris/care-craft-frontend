export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title?: string;
  message: string;
  isRead: boolean;
  broadcastId?: string;
  createdAt: string;
}