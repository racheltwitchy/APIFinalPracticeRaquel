import { Request, Response, Router } from 'express';
// import { UserService } from './user.service';

import { UserService } from "./user.service";

export class UserController {
  public router : Router;
  constructor(
    private userService: UserService
    ) { this.router=Router();
  }
  
  public createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  };

  public getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(404).json({ message: "An unknown error occurred" });
      }
    }
  };

  public updateUser = async (req: Request, res: Response) => {
    try {
      const updatedUser = await this.userService.updateUser(req.params.id, req.body);
      res.status(200).json(updatedUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  };

  public deleteUser = async (req: Request, res: Response) => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(404).json({ message: "An unknown error occurred" });
      }
    }
  };
}
