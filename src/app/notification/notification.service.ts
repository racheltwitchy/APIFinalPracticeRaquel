import { Service } from "typedi";
import { NotificationRepository } from "./notification.repository";
import { Notification } from "./notification.model";

@Service()
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async createNotification(notification: Notification): Promise<number> {
    return this.notificationRepository.createNotification(notification);
  }

  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.getNotificationsByUser(userId);
  }
}
