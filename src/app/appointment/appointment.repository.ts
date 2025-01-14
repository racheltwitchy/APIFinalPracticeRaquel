import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { Appointment } from "./appointment.model";

@Service()
export class AppointmentRepository {
  constructor(private dbService: DatabaseService) {}

  async createAppointment(appointment: Appointment): Promise<number> {
    const result = await this.dbService.execQuery(
      `INSERT INTO appointments (patientId, doctorId, dateTime) VALUES (?, ?, ?)`,
      [appointment.patientId, appointment.doctorId, appointment.dateTime]
    );
  
    // Log actualizado para mostrar el resultado
    console.log("Appointment creation result:", result);
  
    // Retornar `lastID` del resultado
    if (!result.lastID) {
      throw new Error("Failed to create appointment");
    }
    return result.lastID;
  }
  
  async getAppointmentById(appointmentId: number): Promise<Appointment | null> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM appointments WHERE id = ?`,
      [appointmentId]
    );
    return result[0] || null;
  }

  async updateAppointment(appointmentId: number, dateTime: string): Promise<void> {
    await this.dbService.execQuery(
      `UPDATE appointments SET dateTime = ? WHERE id = ?`,
      [dateTime, appointmentId]
    );
  }

  async deleteAppointment(appointmentId: number): Promise<void> {
    await this.dbService.execQuery(
      `DELETE FROM appointments WHERE id = ?`,
      [appointmentId]
    );
  }

  async listAppointmentsByUser(userId: number): Promise<Appointment[]> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM appointments WHERE patientId = ? OR doctorId = ?`,
      [userId, userId]
    );
  
    // Agregar log para depurar
    console.log("Appointments fetched for user:", result);
  
    return result;
  }
  
}
