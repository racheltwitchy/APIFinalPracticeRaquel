import { Service } from "typedi";
import * as bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { User } from "./user.model";
import * as jwt from "jsonwebtoken";
import { config } from "../../config/environment";
import { AuditService } from "../audit-logs/audit.service";

@Service()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private auditService: AuditService
  ) {}

  async createUser(user: User): Promise<number> {
    // Verificar que el email sea único
    const existingUser = await this.userRepository.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Crear el usuario
    const userId = await this.userRepository.createUser({
      ...user,
      password: hashedPassword,
    });

    // Registrar en logs
    await this.auditService.logAction(userId, "User created");

    return userId;
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Registrar en logs
      await this.auditService.logAction(user.id!, "User authenticated");
      return user;
    }
    return null;
  }

  async authenticateAndGenerateToken(email: string, password: string): Promise<string | null> {
    const user = await this.userRepository.getUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generar token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: "1h" }
      );

      // Registrar en logs
      await this.auditService.logAction(user.id!, "Token generated");

      return token;
    }
    return null;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<void> {
    await this.userRepository.updateUser(userId, updates);

    // Registrar en logs
    await this.auditService.logAction(userId, "User updated");
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userRepository.deleteUser(userId);

    // Registrar en logs
    await this.auditService.logAction(userId, "User deleted");
  }

  async listAllUsers(): Promise<User[]> {
    const users = await this.userRepository.listAllUsers();
    return users;
  }
}
