import { Router } from "express";
import { Service } from "typedi";
import { NotificationService } from "./notification.service";
import { authenticateToken } from "../../middleware/auth.middleware";

@Service()
export class NotificationController {
  public router: Router;

  constructor(private notificationService: NotificationService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    // Obtener notificaciones para un usuario
    this.router.get(
      "/",
      authenticateToken(["patient", "doctor", "admin"]),
      async (req, res) => {
        try {
          const userId = (req as any).user.id;
          const notifications = await this.notificationService.getNotificationsForUser(userId);
          res.status(200).json(notifications);
        } catch (error) {
          res.status(400).json({ error: (error as Error).message });
        }
      }
    );
  }
}
