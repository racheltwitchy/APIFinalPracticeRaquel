import { Router } from "express";
import { Service } from "typedi";
import { AppointmentService } from "./appointment.service";
import { authenticateToken } from "../../middleware/auth.middleware";

@Service()
export class AppointmentController {
  public router: Router;

  constructor(private appointmentService: AppointmentService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/",
      authenticateToken(["patient"]),
      async (req, res) => {
        try {
          const appointmentId = await this.appointmentService.createAppointment(req.body);
          res.status(201).json({ appointmentId });
        } catch (error) {
          res.status(400).json({ error: (error as Error).message });
        }
      }
    );

    this.router.put(
      "/:appointmentId",
      authenticateToken(["patient", "doctor", "admin"]),
      async (req, res) => {
        try {
          await this.appointmentService.rescheduleAppointment(
            +req.params.appointmentId,
            req.body.dateTime
          );
          res.status(200).json({ message: "Appointment rescheduled" });
        } catch (error) {
          res.status(400).json({ error: (error as Error).message });
        }
      }
    );

    this.router.delete(
      "/:appointmentId",
      authenticateToken(["patient", "doctor", "admin"]),
      async (req, res) => {
        try {
          await this.appointmentService.cancelAppointment(+req.params.appointmentId);
          res.status(200).json({ message: "Appointment cancelled" });
        } catch (error) {
          res.status(400).json({ error: (error as Error).message });
        }
      }
    );

    this.router.get(
      "/",
      authenticateToken(["patient", "doctor", "admin"]),
      async (req, res): Promise<void> => {
        try {
          const userId = parseInt(req.query.userId as string, 10);
    
          if (isNaN(userId)) {
            res.status(400).json({ error: "Invalid or missing userId parameter" });
          }
    
          const appointments = await this.appointmentService.getAppointmentsForUser(userId);
          res.status(200).json(appointments);
        } catch (error) {
          res.status(400).json({ error: (error as Error).message });
        }
      }
    );
    
    
  }
}
