import { Service } from "typedi";
import { AppointmentRepository } from "./appointment.repository";
import { Appointment } from "./appointment.model";
import { AuditService } from "../audit-logs/audit.service";
import { UserRepository } from "../user/user.repository";

@Service()
export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private auditService: AuditService,
    private userRepository: UserRepository
  ) {}

  async createAppointment(appointment: Appointment): Promise<number> {
    // Verificar que el paciente exista
    const patient = await this.userRepository.getUserById(appointment.patientId);
    if (!patient || patient.role !== "patient") {
      throw new Error("Invalid patient ID");
    }

    // Verificar que el doctor exista
    const doctor = await this.userRepository.getUserById(appointment.doctorId);
    if (!doctor || doctor.role !== "doctor") {
      throw new Error("Invalid doctor ID");
    }

    // Crear la cita
    const appointmentId = await this.appointmentRepository.createAppointment(appointment);

    // Registrar en logs
    await this.auditService.logAction(appointment.patientId, `Created an appointment with reason: ${appointment.reason}`);

    return appointmentId;
  }

  async rescheduleAppointment(appointmentId: number, dateTime: string): Promise<void> {
    await this.appointmentRepository.updateAppointment(appointmentId, { dateTime });

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

  async getAppointmentsForUser(userId: number): Promise<Appointment[]> {
    // Validar que el usuario existe y es paciente o doctor
    const user = await this.userRepository.getUserById(userId);
    if (!user || (user.role !== "patient" && user.role !== "doctor")) {
      throw new Error("Invalid userId or user role");
    }
  
    // Obtener las citas
    const appointments = await this.appointmentRepository.getAppointmentsByUserId(userId);
  
    if (appointments.length === 0) {
      throw new Error("No appointments found for this user");
    }
  
    return appointments;
  }
  
}
