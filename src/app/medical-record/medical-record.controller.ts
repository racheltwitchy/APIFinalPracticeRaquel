import { Router } from "express";
import { Service } from "typedi";
import { MedicalRecordService } from "./medical-record.service";
import { authenticateToken } from "../../middleware/auth.middleware";

@Service()
export class MedicalRecordController {
  public router: Router;

  constructor(private medicalRecordService: MedicalRecordService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/",
      authenticateToken(["doctor"]),
      async (req, res) => {
        try {
          const recordId = await this.medicalRecordService.createRecord(req.body);
          res.status(201).json({ recordId });
        } catch (error) {
          res.status(400).json({ error: (error as Error).message });
        }
      }
    );

    this.router.put(
        "/:recordId",
        authenticateToken(["doctor"]),
        async (req, res) => {
          try {
            const doctorId = (req as any).user.id; // ID del doctor autenticado
            await this.medicalRecordService.updateRecord(+req.params.recordId, req.body, doctorId);
            res.status(200).json({ message: "Medical record updated" });
          } catch (error) {
            res.status(400).json({ error: (error as Error).message });
          }
        }
      );
      
      this.router.get(
        "/",
        authenticateToken(["patient", "doctor", "admin"]),
        async (req, res) => {
          try {
            const user = (req as any).user;
            const records = await this.medicalRecordService.getMedicalRecords(user.id, user.role);
            res.status(200).json(records);
          } catch (error) {
            res.status(400).json({ error: (error as Error).message });
          }
        }
      );
  }
}
