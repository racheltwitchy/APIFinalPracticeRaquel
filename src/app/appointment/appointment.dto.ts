export interface CreateAppointmentDTO {
    patientId: string;
    doctorId: string;
    date: string; // ISO 8601 format
    reason?: string;
  }
  
  export interface UpdateAppointmentDTO {
    date?: string; // ISO 8601 format
    reason?: string;
  }
  