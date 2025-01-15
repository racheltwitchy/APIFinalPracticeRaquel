import { NotificationService } from "../notification/notification.service";

@Service()
export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private auditService: AuditService,
    private userRepository: UserRepository,
    private notificationService: NotificationService // Servicio de notificaciones
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

    // Crear notificación para el paciente
    await this.notificationService.createNotification({
      userId: appointment.patientId,
      message: `Your appointment with doctor ID: ${appointment.doctorId} has been confirmed.`,
      type: "appointment"
    });

    // Crear notificación para el doctor
    await this.notificationService.createNotification({
      userId: appointment.doctorId,
      message: `You have a new appointment with patient ID: ${appointment.patientId}.`,
      type: "appointment"
    });

    // Registrar en logs
    await this.auditService.logAction(appointment.patientId, `Created an appointment with reason: ${appointment.reason}`);

    return appointmentId;
  }

  async rescheduleAppointment(appointmentId: number, dateTime: string): Promise<void> {
    await this.appointmentRepository.updateAppointment(appointmentId, { dateTime });

    // Crear notificación
    const appointment = await this.appointmentRepository.getAppointmentById(appointmentId);
    if (appointment) {
      await this.notificationService.createNotification({
        userId: appointment.patientId,
        message: `Your appointment has been rescheduled to ${dateTime}.`,
        type: "appointment"
      });

      await this.notificationService.createNotification({
        userId: appointment.doctorId,
        message: `Your appointment has been rescheduled to ${dateTime}.`,
        type: "appointment"
      });
    }

    // Registrar en logs
    await this.auditService.logAction(appointmentId, "Rescheduled an appointment");
  }

  async cancelAppointment(appointmentId: number): Promise<void> {
    const appointment = await this.appointmentRepository.getAppointmentById(appointmentId);

    if (appointment) {
      // Crear notificaciones
      await this.notificationService.createNotification({
        userId: appointment.patientId,
        message: `Your appointment with doctor ID: ${appointment.doctorId} has been cancelled.`,
        type: "appointment"
      });

      await this.notificationService.createNotification({
        userId: appointment.doctorId,
        message: `Your appointment with patient ID: ${appointment.patientId} has been cancelled.`,
        type: "appointment"
      });
    }

    // Eliminar la cita
    await this.appointmentRepository.deleteAppointment(appointmentId);

    // Registrar en logs
    await this.auditService.logAction(appointmentId, "Cancelled an appointment");
  }
}
