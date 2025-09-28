import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { MailService } from 'src/mail/mail.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

function generateSixDigitCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, code: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const cachedCode = await this.cacheManager.get(email);
    if (!cachedCode) {
      throw new UnauthorizedException('Code not generated');
    }

    if (code !== cachedCode) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.cacheManager.del(email);

    return user;
  }

  async sendCode(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const code = generateSixDigitCode();

    this.cacheManager.set(email, code);

    this.mailService.sendProposal({
      to: email,
      subject: 'no-reply',
      text: code,
      user: process.env.SMTP_MAIL_USER || '',
      pass: process.env.SMTP_MAIL_PASS || '',
    });

    return { success: true };
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
  }
}
