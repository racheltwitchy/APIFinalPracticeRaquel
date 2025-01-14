import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { User } from './user.model';
import { UserRepository } from './user.repository';

export class UserService {
  private userRepository = new UserRepository();

  public async createUser(userData: CreateUserDTO): Promise<User> {
    return this.userRepository.create(userData);
  }

  public async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  public async updateUser(userId: string, userData: UpdateUserDTO): Promise<User | null> {
    return this.userRepository.update(userId, userData);
  }

  public async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
