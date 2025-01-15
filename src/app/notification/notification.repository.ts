import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { Notification } from "./notification.model";

@Service()
export class NotificationRepository {
  constructor(private dbService: DatabaseService) {}

  async createNotification(notification: Notification): Promise<number> {
    if (!notification.userId) {
      throw new Error("Invalid notification: userId is required");
    }
  
    const result = await this.dbService.execQuery(
      `INSERT INTO notifications (userId, message, type) VALUES (?, ?, ?)`,
      [notification.userId, notification.message, notification.type]
    );
  
    return (result as any).lastID;
  }
  

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await this.dbService.execQuery(
      `SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC`,
      [userId]
    );
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await this.dbService.execQuery(
      `SELECT * FROM notifications ORDER BY timestamp DESC`
    );
  }
  
}
