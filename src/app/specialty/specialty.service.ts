import { Service } from "typedi";
import { SpecialtyRepository } from "./specialty.repository";

@Service()
export class SpecialtyService {
  constructor(private specialtyRepository: SpecialtyRepository) {}

  async listSpecialties() {
    return this.specialtyRepository.listSpecialties();
  }
}
