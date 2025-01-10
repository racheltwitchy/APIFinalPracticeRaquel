export interface CreateUserDTO {
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    specialties?: string[]; // Applicable only for doctors
  }
  
  export interface UpdateUserDTO {
    name?: string;
    email?: string;
    specialties?: string[];
  }
  