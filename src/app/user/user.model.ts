export interface User {
  id?: number;
  username: string;
  password: string;
  role: "patient" | "doctor" | "admin";
}
