import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { User } from "./user.model";

@Service()
export class UserRepository {
  constructor(private dbService: DatabaseService) {}

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return result[0] || null;
  }
  
  async createUser(user: User): Promise<number> {
    const result = await this.dbService.execQuery(
      `INSERT INTO users (username, email, password, role, departmentId) VALUES (?, ?, ?, ?, ?)`,
      [user.username, user.email, user.password, user.role, user.departmentId || null]
    );

    const userId = result.lastID;

    // Insertar especialidades para doctores
    if (user.role === "doctor" && user.specialtyIds) {
      for (const specialtyId of user.specialtyIds) {
        await this.dbService.execQuery(
          `INSERT INTO doctor_specialties (doctorId, specialtyId) VALUES (?, ?)`,
          [userId, specialtyId]
        );
      }
    }

    return userId;
  }
  

  async getUserById(userId: number): Promise<User | null> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await this.dbService.execQuery(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );
    return result[0] || null;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<void> {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    await this.dbService.execQuery(`UPDATE users SET ${fields} WHERE id = ?`, [
      ...values,
      userId,
    ]);
  }

  async deleteUser(userId: number): Promise<void> {
    await this.dbService.execQuery(`DELETE FROM users WHERE id = ?`, [userId]);
  }

  async listAllUsers(): Promise<User[]> {
    const result = await this.dbService.execQuery(`SELECT * FROM users`);
    return result;
  }
  
}
