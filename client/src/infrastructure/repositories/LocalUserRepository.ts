import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

const STORAGE_KEY = 'medSimUsers';

export class LocalUserRepository implements IUserRepository {
  private getUsersData(): Record<string, User> {
    if (typeof window === 'undefined') return {}; // Check for SSR
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private saveUsersData(data: Record<string, User>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async save(user: User): Promise<void> {
    const users = this.getUsersData();
    users[user.email] = user;
    this.saveUsersData(users);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = this.getUsersData();
    return users[email] || null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const users = this.getUsersData();
    return Object.values(users).find(u => u.nickname.toLowerCase() === nickname.toLowerCase()) || null;
  }

  async getAll(): Promise<User[]> {
    const users = this.getUsersData();
    return Object.values(users);
  }
}
