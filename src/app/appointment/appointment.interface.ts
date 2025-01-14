import { Appointment } from './appointment.model';

export interface IAppointmentService {
  createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment>;
  getAppointmentById(appointmentId: string): Promise<Appointment | null>;
  updateAppointment(appointmentId: string, appointmentData: Partial<Appointment>): Promise<Appointment | null>;
  deleteAppointment(appointmentId: string): Promise<void>;
}

export interface IAppointmentRepository {
  create(appointmentData: Partial<Appointment>): Promise<Appointment>;
  findById(appointmentId: string): Promise<Appointment | null>;
  update(appointmentId: string, appointmentData: Partial<Appointment>): Promise<Appointment | null>;
  delete(appointmentId: string): Promise<void>;
}
