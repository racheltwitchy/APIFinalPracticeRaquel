import { Service } from "typedi";
import { AppointmentRepository } from "./appointment.repository";
import { Appointment } from "./appointment.model";
import { AuditService } from "../audit-logs/audit.service";

@Service()
export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private auditService: AuditService
  ) {}

  async createAppointment(appointment: Appointment): Promise<number> {
    const appointmentId = await this.appointmentRepository.createAppointment(appointment);

    // Registrar en logs
    await this.auditService.logAction(appointment.patientId, "Created an appointment");
    return appointmentId;
  }

  async rescheduleAppointment(appointmentId: number, dateTime: string): Promise<void> {
    await this.appointmentRepository.updateAppointment(appointmentId, dateTime);

    // Registrar en logs
    await this.auditService.logAction(appointmentId, "Rescheduled an appointment");
  }

  async cancelAppointment(appointmentId: number): Promise<void> {
    await this.appointmentRepository.deleteAppointment(appointmentId);

    // Registrar en logs
    await this.auditService.logAction(appointmentId, "Cancelled an appointment");
  }

  async listAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepository.listAppointmentsByUser(userId);
  }
}
