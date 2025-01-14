import { Router } from "express";
import { Service } from "typedi";
import { DepartmentService } from "./department.service";

@Service()
export class DepartmentController {
  public router: Router;

  constructor(private departmentService: DepartmentService) {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.get("/", async (req, res) => {
      try {
        const departments = await this.departmentService.listDepartments();
        res.status(200).json(departments);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });
  }
}
