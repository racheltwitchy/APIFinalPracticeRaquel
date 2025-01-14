import { Router } from "express";
import { Service } from "typedi";
import { UserController } from "../../app/user/user.controller";
import { AuditController } from "../../app/audit-logs/audit.controller";
import { AppointmentController } from "../../app/appointment/appointment.controller";
import { MedicalRecordController } from "../../app/medical-record/medical-record.controller";

@Service()
export class Api {
  private router: Router;

  constructor(
    private userController: UserController,
    private auditController: AuditController,
    private appointmentController: AppointmentController,
    private medicalRecordController: MedicalRecordController
    ) {
    this.router = Router();
    this.mountRoutes();
  }

  private mountRoutes() {
    this.router.use("/users", this.userController.router);
    this.router.use("/audit-logs", this.auditController.router);
    this.router.use("/appointments", this.appointmentController.router);
    this.router.use("/medical-records", this.medicalRecordController.router);
  }

  getRouter(): Router {
    return this.router;
  }
}
