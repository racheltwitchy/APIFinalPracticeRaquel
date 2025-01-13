import { Router } from "express";
import { Service } from "typedi";
import { UserController } from "../../app/user/user.controller";

@Service()
export class Api {
  private apiRouter: Router;

  constructor(
    private userController: UserController
  ) {
    this.apiRouter = Router();

    // Public Routes
    this.apiRouter.use("/users", userController.router);

  }

  getApiRouter(): Router {
    return this.apiRouter;
  }
}
