export interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    specialties?: string[]; // Applicable only for doctors
  }
  