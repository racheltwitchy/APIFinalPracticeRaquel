import { Service } from "typedi";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { UserRepository } from "./user.repository";
import { User } from "./user.model";
import { config } from "../../config/environment";
import { AuditService } from "../audit-logs/audit.service";
import { SpecialtyRepository } from "../specialty/specialty.repository";
import { DepartmentRepository } from "../department/department.repository";

@Service()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private auditService: AuditService,
    private specialtyRepository: SpecialtyRepository,
    private departmentRepository: DepartmentRepository
  ) {}

  async createUser(user: User): Promise<number> {
    // Verificar que el email sea único
    const existingUser = await this.userRepository.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Validar datos específicos de doctores
    if (user.role === "doctor") {
      // Validar que el departmentId sea válido
      if (!user.departmentId) {
        throw new Error("Doctor must have a valid departmentId");
      }
      const department = await this.departmentRepository.getDepartmentById(user.departmentId);
      if (!department) {
        throw new Error("Invalid departmentId");
      }

      // Validar que las specialtyIds sean válidas
      if (!user.specialtyIds || user.specialtyIds.length === 0) {
        throw new Error("Doctor must have at least one specialty");
      }
      const validSpecialtyIds = (await this.specialtyRepository.listSpecialties()).map(
        (specialty) => specialty.specialtyId
      );
      for (const specialtyId of user.specialtyIds) {
        if (!validSpecialtyIds.includes(specialtyId)) {
          throw new Error(`Invalid specialtyId: ${specialtyId}`);
        }
      }
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

  async authenticateUser(email: string, password: string): Promise<User | null> {
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
    if (updates.role === "doctor") {
      // Validar que el doctor tiene un departmentId válido
      if (updates.departmentId) {
        const department = await this.departmentRepository.getDepartmentById(updates.departmentId);
        if (!department) {
          throw new Error("Invalid departmentId");
        }
      }

      // Validar que las specialtyIds sean válidas
      if (updates.specialtyIds && updates.specialtyIds.length > 0) {
        const validSpecialtyIds = (await this.specialtyRepository.listSpecialties()).map(
          (specialty) => specialty.specialtyId
        );
        for (const specialtyId of updates.specialtyIds) {
          if (!validSpecialtyIds.includes(specialtyId)) {
            throw new Error(`Invalid specialtyId: ${specialtyId}`);
          }
        }
      }
    }

    // Actualizar usuario
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
