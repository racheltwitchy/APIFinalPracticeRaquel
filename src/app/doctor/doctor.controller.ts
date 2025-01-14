import { Router } from "express";
import { Service } from "typedi";
import { DoctorService } from "./doctor.service";

@Service()
export class DoctorController {
  public router: Router;

  constructor(private doctorService: DoctorService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", async (req, res) => {
      try {
        const specialtyId = parseInt(req.query.specialtyId as string, 10);
        const doctors = await this.doctorService.filterDoctorsBySpecialty(specialtyId);
        res.status(200).json(doctors);
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });
  }
}
