import { Service } from "typedi";
import * as bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { User } from "./user.model";

@Service()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(user: User): Promise<number> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    return this.userRepository.createUser({
      ...user,
      password: hashedPassword,
    });
  }

  async authenticateUser(
    username: string,
    password: string
  ): Promise<User | null> {
    const user = await this.userRepository.getUserByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
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
