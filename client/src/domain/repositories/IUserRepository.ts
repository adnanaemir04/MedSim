import { User } from '../entities/User';

export interface IUserRepository {
  save(user: User): Promise<User | void>;
  findByEmail(email: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  getAll(): Promise<User[]>;
}
