import { Router } from "express";
import { Service } from "typedi";
import { AuditService } from "./audit.service";
import { authenticateToken } from "../../middleware/auth.middleware";

@Service()
export class AuditController {
  public router: Router;

  constructor(private auditService: AuditService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    // Endpoint para consultar logs (solo admins)
    this.router.get("/", authenticateToken(["admin"]), async (req, res) => {
      try {
        const filters = {
          userId: req.query.userId ? Number(req.query.userId) : undefined,
          action: req.query.action as string,
          date: req.query.date as string,
        };
        const logs = await this.auditService.getLogs(filters);
        res.status(200).json(logs);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });
  }
}
