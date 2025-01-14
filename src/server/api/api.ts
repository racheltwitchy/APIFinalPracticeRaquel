import { Router } from "express";
import { Service } from "typedi";
import { UserController } from "../../app/user/user.controller";
import { AuditController } from "../../app/audit-logs/audit.controller";

@Service()
export class Api {
  private router: Router;

  constructor(
    private userController: UserController,
    private auditController: AuditController
    ) {
    this.router = Router();
    this.mountRoutes();
  }

  private mountRoutes() {
    this.router.use("/users", this.userController.router);
    this.router.use("/audit-logs", this.auditController.router);
  }

  getRouter(): Router {
    return this.router;
  }
}
