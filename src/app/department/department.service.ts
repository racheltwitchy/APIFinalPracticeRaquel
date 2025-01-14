import { Service } from "typedi";
import { DepartmentRepository } from "./department.repository";

@Service()
export class DepartmentService {
  constructor(private departmentRepository: DepartmentRepository) {}

  async listDepartments() {
    return this.departmentRepository.listDepartments();
  }
}
