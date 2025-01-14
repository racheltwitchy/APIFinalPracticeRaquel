export interface MedicalRecord {
    id?: number;
    patientId: number;
    doctorId: number;
    diagnosis: string;
    prescriptions?: string; // Opcional
    testResults?: string; // Opcional
    ongoingTreatments?: string; // Opcional
    timestamp?: string; // Fecha de creación del registro
  }
  