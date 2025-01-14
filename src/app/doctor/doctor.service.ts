import { Service } from "typedi";
import { DoctorRepository } from "./doctor.repository";

@Service()
export class DoctorService {
  constructor(private doctorRepository: DoctorRepository) {}

  async filterDoctorsBySpecialty(specialtyId: number): Promise<any[]> {
    return this.doctorRepository.filterDoctorsBySpecialty(specialtyId);
  }
}
