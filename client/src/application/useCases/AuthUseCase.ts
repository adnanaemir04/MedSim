import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async register(email: string, nickname: string, password?: string): Promise<User> {
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('Bu e-posta adresi zaten kullanımda.');
    }

    const existingNickname = await this.userRepository.findByNickname(nickname);
    if (existingNickname) {
      throw new Error('Bu nickname (kullanıcı adı) zaten alınmış. Lütfen başka bir tane seçin.');
    }

    const newUser: User = {
      email,
      nickname,
      password,
      points: 20, // Initial bonus points
      solvedCases: [],
      avatar: '👨‍⚕️'
    };

    const savedUser = await this.userRepository.save(newUser);
    return savedUser || newUser;
  }

  async login(email: string, password?: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || user.password !== password) {
      throw new Error('Hatalı e-posta veya şifre.');
    }
    return user;
  }
}
