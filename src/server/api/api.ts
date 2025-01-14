import { Router } from "express";
import { Service } from "typedi";
import { UserController } from "../../app/user/user.controller";

@Service()
export class Api {
  private router: Router;

  constructor(private userController: UserController) {
    this.router = Router();
    this.mountRoutes();
  }

  private mountRoutes() {
    this.router.use("/users", this.userController.router);
  }

  getRouter(): Router {
    return this.router;
  }
}
