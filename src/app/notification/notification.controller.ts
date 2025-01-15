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
            const user = (req as any).user; // Obtener usuario autenticado
            const notifications = await this.notificationService.getNotifications(user.id, user.role); // Llama a getNotifications
            res.status(200).json(notifications); // Retorna notificaciones
          } catch (error) {
            res.status(400).json({ error: (error as Error).message });
          }
        }
      );
      
  }
}
