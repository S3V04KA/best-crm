import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PERMISSIONS_KEY } from './roles.decorator';
import { User } from '../entities/user.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserPermissionOverride)
    private readonly userOverrideRepo: Repository<UserPermissionOverride>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user.userId;

    if (!userId) return false;

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user) return false;

    const [overrides, rolePermissions] = await Promise.all([
      this.userOverrideRepo.find({
        where: { user: { id: userId }, permission: { code: In(required) } },
        select: { permission: { code: true }, allowed: true },
        relations: { permission: true }
      }),
      this.rolePermRepo.find({
        where: { role: { id: user.role.id }, permission: { code: In(required) } },
        select: { permission: { code: true }, allowed: true },
        relations: { permission: true },
      }),
    ]);

    const overrideMap = new Map<string, boolean>(
      overrides.map((o) => [o.permission.code, o.allowed]),
    );

    req.user.rolePermissions = await this.rolePermRepo.find({
      where: { role: { id: user.role.id } },
      select: { permission: { code: true }, allowed: true },
      relations: { permission: true },
    });

    for (const code of required) {
      const override = overrideMap.get(code);
      if (override !== undefined) {
        if (!override) return false;
        continue;
      }

      const rolePerm = rolePermissions.find((rp) => rp.permission.code === code);
      if (!rolePerm || !rolePerm.allowed) return false;
    }

    return true;
  }
}
