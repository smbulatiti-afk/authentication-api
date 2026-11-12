import {
  ConflictException, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private async createAuthResponse(user: User) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });
    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }

  async register(dto: RegisterDto) {
    const username = dto.username.trim();
    const existing = await this.users.findOne({ where: { username } });
    if (existing) throw new ConflictException('Username is already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.users.create({ username, password: passwordHash });

    try {
      const saved = await this.users.save(user);
      return this.createAuthResponse(saved);
    } catch (error) {
      // The database unique index also protects against simultaneous duplicate registrations.
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username is already taken');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const username = dto.username.trim();
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.createAuthResponse(user);
  }

  async me(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return { user: { id: user.id, username: user.username } };
  }
}
