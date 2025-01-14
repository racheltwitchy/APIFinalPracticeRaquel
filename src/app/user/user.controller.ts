import { Router } from "express";
import { Service } from "typedi";
import { UserService } from "./user.service";
import { authenticateToken } from "../../middleware/auth.middleware";

@Service()
export class UserController {
  public router: Router;

  constructor(private userService: UserService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.post("/", async (req, res) => {
      try {
        const userId = await this.userService.createUser(req.body);
        res.status(201).json({ userId });
      } catch (error) {
        res.status(400).json({ error: "error.message" });
      }
    });

    this.router.put("/:userId", async (req, res) => {
      try {
        await this.userService.updateUser(+req.params.userId, req.body);
        res.status(200).json({ message: "User updated successfully" });
      } catch (error) {
        res.status(400).json({ error: "error.message" });
      }
    });

    this.router.delete("/:userId", async (req, res) => {
      try {
        await this.userService.deleteUser(+req.params.userId);
        res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
        res.status(400).json({ error: "error.message" });
      }
    });

    this.router.get("/", authenticateToken(["admin"]), async (req, res) => {
      try {
        const users = await this.userService.listAllUsers();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: "error.message" });
      }
    });
    
    this.router.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const token = await this.userService.authenticateAndGenerateToken(email, password);
        if (token) {
          res.status(200).json({ token });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      } catch (error) {
        res.status(500).json({ error: "Error during login" });
      }
    });
  }
}
