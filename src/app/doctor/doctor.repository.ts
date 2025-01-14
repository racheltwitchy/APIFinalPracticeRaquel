import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";

@Service()
export class DoctorRepository {
  constructor(private dbService: DatabaseService) {}

  async filterDoctorsBySpecialty(specialtyId: number): Promise<any[]> {
    const doctors = await this.dbService.execQuery(
      `SELECT u.id as doctorId, u.username as name, d.name as department
       FROM users u
       INNER JOIN doctor_specialties ds ON u.id = ds.doctorId
       INNER JOIN departments d ON u.departmentId = d.departmentId
       WHERE ds.specialtyId = ?`,
      [specialtyId]
    );

    for (const doctor of doctors) {
      const specialties = await this.dbService.execQuery(
        `SELECT s.name FROM doctor_specialties ds
         INNER JOIN specialties s ON ds.specialtyId = s.specialtyId
         WHERE ds.doctorId = ?`,
        [doctor.doctorId]
      );
      doctor.specialties = specialties.map((s: any) => s.name);
    }

    return doctors;
  }
}
