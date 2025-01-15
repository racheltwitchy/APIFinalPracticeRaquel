import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { Appointment } from "./appointment.model";

@Service()
export class AppointmentRepository {
  constructor(private dbService: DatabaseService) {}

  async createAppointment(appointment: Appointment): Promise<number> {
    const result = await this.dbService.execQuery(
      `INSERT INTO appointments (patientId, doctorId, dateTime, reason) VALUES (?, ?, ?, ?)`,
      [appointment.patientId, appointment.doctorId, appointment.dateTime, appointment.reason || null]
    );
    return (result as any).lastID;
  }

  async updateAppointment(appointmentId: number, updates: Partial<Appointment>): Promise<void> {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);

    await this.dbService.execQuery(
      `UPDATE appointments SET ${fields} WHERE id = ?`,
      [...values, appointmentId]
    );
  }

  async deleteAppointment(appointmentId: number): Promise<void> {
    await this.dbService.execQuery(`DELETE FROM appointments WHERE id = ?`, [appointmentId]);
  }

  async listAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return await this.dbService.execQuery(
      `SELECT * FROM appointments WHERE patientId = ? OR doctorId = ?`,
      [userId, userId]
    );
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return await this.dbService.execQuery(
      `SELECT * FROM appointments WHERE patientId = ? OR doctorId = ?`,
      [userId, userId]
    );
  }

  async getAppointmentById(appointmentId: number): Promise<Appointment | null> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM appointments WHERE id = ?`,
      [appointmentId]
    );
    return result[0] || null;
  }
  
  
}
