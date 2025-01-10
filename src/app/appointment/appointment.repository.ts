import { Appointment } from './appointment.model';

export class AppointmentRepository {
  private appointments: Appointment[] = [];

  public async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    // Validar que las propiedades obligatorias están presentes
    if (!appointmentData.patientId || !appointmentData.doctorId || !appointmentData.date) {
      throw new Error('Missing required appointment properties: patientId, doctorId, or date');
    }

    // Crear un nuevo objeto Appointment asegurando que todas las propiedades estén presentes
    const newAppointment: Appointment = {
      id: (this.appointments.length + 1).toString(), // Generar un ID único
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      reason: appointmentData.reason || '', // Propiedad opcional, usar valor por defecto si no está presente
    };

    this.appointments.push(newAppointment);
    return newAppointment;
  }

  public async findById(appointmentId: string): Promise<Appointment | null> {
    return this.appointments.find(appointment => appointment.id === appointmentId) || null;
  }

  public async update(appointmentId: string, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    const appointmentIndex = this.appointments.findIndex(appointment => appointment.id === appointmentId);
    if (appointmentIndex === -1) return null;

    // Actualizar solo las propiedades presentes en appointmentData
    this.appointments[appointmentIndex] = {
      ...this.appointments[appointmentIndex],
      ...appointmentData,
    };

    return this.appointments[appointmentIndex];
  }

  public async delete(appointmentId: string): Promise<void> {
    this.appointments = this.appointments.filter(appointment => appointment.id !== appointmentId);
  }
}
