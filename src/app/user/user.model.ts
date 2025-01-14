export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: "patient" | "doctor" | "admin";
  departmentId?: number; // Opcional para pacientes, obligatorio para doctores
  specialtyIds?: number[]; // Array de IDs de especialidades (para doctores)
}
