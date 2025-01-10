import { User } from './user.model';

export class UserRepository {
  private users: User[] = [];

  public async create(userData: Partial<User>): Promise<User> {
    // Validar que las propiedades obligatorias están definidas
    if (!userData.name || !userData.email || !userData.role) {
      throw new Error('Missing required user properties: name, email, or role');
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: userData.name, // Aseguramos que no sea undefined
      email: userData.email, // Aseguramos que no sea undefined
      role: userData.role, // Aseguramos que no sea undefined
      specialties: userData.specialties || [], // Opcional: por defecto vacío si no se proporciona
    };

    this.users.push(newUser);
    return newUser;
  }

  public async findById(userId: string): Promise<User | null> {
    return this.users.find(user => user.id === userId) || null;
  }

  public async update(userId: string, userData: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === userId);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  public async delete(userId: string): Promise<void> {
    this.users = this.users.filter(user => user.id !== userId);
  }
}
