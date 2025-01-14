export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  reason?: string; // Nueva propiedad
}
