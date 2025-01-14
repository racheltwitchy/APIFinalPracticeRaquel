import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { MedicalRecord } from "./medical-record.model";

@Service()
export class MedicalRecordRepository {
  constructor(private dbService: DatabaseService) {}

  async createRecord(record: MedicalRecord): Promise<number> {
    const result = await this.dbService.execQuery(
      `INSERT INTO medical_records (patientId, doctorId, diagnosis, prescriptions, testResults, ongoingTreatments)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [record.patientId, record.doctorId, record.diagnosis, record.prescriptions, record.testResults, record.ongoingTreatments]
    );
    return (result as any).lastID;
  }

  async updateRecord(recordId: number, updates: Partial<MedicalRecord>): Promise<void> {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);

    await this.dbService.execQuery(
      `UPDATE medical_records SET ${fields} WHERE id = ?`,
      [...values, recordId]
    );
  }

  async getRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return await this.dbService.execQuery(
      `SELECT * FROM medical_records WHERE patientId = ?`,
      [patientId]
    );
  }

  async getRecordsByDoctor(doctorId: number): Promise<MedicalRecord[]> {
    return await this.dbService.execQuery(
      `SELECT * FROM medical_records WHERE doctorId = ?`,
      [doctorId]
    );
  }

  async getRecordById(recordId: number): Promise<MedicalRecord | null> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM medical_records WHERE id = ?`,
      [recordId]
    );
    return result[0] || null;
  }
}
