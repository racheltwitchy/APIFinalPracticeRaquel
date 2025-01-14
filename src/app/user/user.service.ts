import { Service } from "typedi";
import * as bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { User } from "./user.model";
import * as jwt from "jsonwebtoken";
import { config } from "../../config/environment";

@Service()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(user: User): Promise<number> {
    // Verificar que el email sea único
    const existingUser = await this.userRepository.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }
  
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);
  
    // Crear el usuario
    return this.userRepository.createUser({
      ...user,
      password: hashedPassword,
    });
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.userRepository.getUserByUsername(email);
    if (user && (await bcrypt.compare(password, user.password))) {
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
      return token;
    }
    return null;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<void> {
    await this.userRepository.updateUser(userId, updates);
  }

  async deleteUser(userId: number): Promise<void> {
    await this.userRepository.deleteUser(userId);
  }

  async listAllUsers(): Promise<User[]> {
    return this.userRepository.listAllUsers();
  }
  
}
