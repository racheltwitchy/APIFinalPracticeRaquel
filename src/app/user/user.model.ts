export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: "patient" | "doctor" | "admin";
}
