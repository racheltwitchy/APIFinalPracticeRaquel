import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { Specialty } from "./specialty.model";

@Service()
export class SpecialtyRepository {
  constructor(private dbService: DatabaseService) {}

  async listSpecialties(): Promise<Specialty[]> {
    return await this.dbService.execQuery(`SELECT * FROM specialties`);
  }
}
