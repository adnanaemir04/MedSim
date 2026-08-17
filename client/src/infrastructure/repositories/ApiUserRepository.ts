import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

const API_BASE_URL = 'http://localhost:5000/api'; // Or 5001 / https

export class ApiUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        nickname: user.nickname,
        password: user.password
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Kayıt olurken bir hata oluştu.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    // In a real app, this would be a specific endpoint, or we just rely on login endpoint.
    return null; 
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return null;
  }

  async getAll(): Promise<User[]> {
    return [];
  }

  async login(email: string, password?: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Giriş başarısız.');
    }

    return await res.json();
  }
}
