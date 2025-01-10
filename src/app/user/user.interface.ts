import { User } from './user.model';

export interface IUserService {
  createUser(userData: Partial<User>): Promise<User>;
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, userData: Partial<User>): Promise<User | null>;
  deleteUser(userId: string): Promise<void>;
}

export interface IUserRepository {
  create(userData: Partial<User>): Promise<User>;
  findById(userId: string): Promise<User | null>;
  update(userId: string, userData: Partial<User>): Promise<User | null>;
  delete(userId: string): Promise<void>;
}
