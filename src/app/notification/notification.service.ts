import { Service } from "typedi";
import { NotificationRepository } from "./notification.repository";
import { Notification } from "./notification.model";

@Service()
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async createNotification(notification: Notification): Promise<number> {
    return this.notificationRepository.createNotification(notification);
  }
  
  async getNotifications(userId: number, role: string): Promise<Notification[]> {
    if (role === "admin") {
      // Devolver todas las notificaciones para administradores
      return await this.notificationRepository.getAllNotifications();
    }

    // Devolver notificaciones solo para el usuario especificado
    return await this.notificationRepository.getNotificationsByUser(userId);
  }
}
