import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { Department } from "./department.model";

@Service()
export class DepartmentRepository {
  constructor(private dbService: DatabaseService) {}

  async listDepartments(): Promise<Department[]> {
    const departments = await this.dbService.execQuery(`SELECT * FROM departments`);
    for (const department of departments) {
      const services = await this.dbService.execQuery(
        `SELECT service FROM department_services WHERE departmentId = ?`,
        [department.departmentId]
      );
      department.services = services.map((s: any) => s.service);
    }
    return departments;
  }
}
