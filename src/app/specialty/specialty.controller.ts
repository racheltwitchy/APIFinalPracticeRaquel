import { Router } from "express";
import { Service } from "typedi";
import { SpecialtyService } from "./specialty.service";

@Service()
export class SpecialtyController {
  public router: Router;

  constructor(private specialtyService: SpecialtyService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", async (req, res) => {
      try {
        const specialties = await this.specialtyService.listSpecialties();
        res.status(200).json(specialties);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });
  }
}
