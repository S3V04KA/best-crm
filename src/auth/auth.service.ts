import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: { id: string; email: string; role?: Role | null }) {
    const payload = { sub: user.id, role: user.role?.code, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(fullName: string, email: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }
    const user = this.userRepo.create({
      fullName,
      email,
    });
    // assign role: first registered user becomes admin, others manager
    const usersCount = await this.userRepo.count();
    const desiredRoleCode = usersCount === 0 ? 'admin' : 'member';
    const defaultRole = await this.roleRepo.findOne({
      where: { code: desiredRoleCode },
    });
    if (!defaultRole) {
      throw new UnauthorizedException('Default role not found');
    }
    user.role = defaultRole;
    await this.userRepo.save(user);
    return this.login({ id: user.id, email: user.email, role: user.role });
  }
}
