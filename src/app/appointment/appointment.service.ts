import { CreateAppointmentDTO, UpdateAppointmentDTO } from './appointment.dto';
import { Appointment } from './appointment.model';
import { AppointmentRepository } from './appointment.repository';

export class AppointmentService {
  private appointmentRepository = new AppointmentRepository();

  public async createAppointment(appointmentData: CreateAppointmentDTO): Promise<Appointment> {
    return this.appointmentRepository.create(appointmentData);
  }

  public async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    return this.appointmentRepository.findById(appointmentId);
  }

  public async updateAppointment(appointmentId: string, appointmentData: UpdateAppointmentDTO): Promise<Appointment | null> {
    return this.appointmentRepository.update(appointmentId, appointmentData);
  }

  public async deleteAppointment(appointmentId: string): Promise<void> {
    await this.appointmentRepository.delete(appointmentId);
  }
}
