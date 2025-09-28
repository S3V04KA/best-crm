import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ACLService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
    @InjectRepository(UserPermissionOverride)
    private readonly userOverrideRepo: Repository<UserPermissionOverride>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  listAllPermissions() {
    return { permissions: this.permRepo.find() };
  }

  async listCurrentUserPermissions(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const rolePerms = await this.rolePermRepo.find({
      where: { role: { id: user.role.id }, allowed: true },
      relations: ['permission'],
    });
    const overrides = await this.userOverrideRepo.find({
      where: { user: { id: user.id } },
      relations: ['permission'],
    });
    const permMap = new Map<string, boolean>();
    for (const rp of rolePerms) permMap.set(rp.permission.code, true);
    for (const ov of overrides) permMap.set(ov.permission.code, ov.allowed);
    return {
      permissions: Array.from(permMap.entries())
        .filter(([, allowed]) => allowed)
        .map(([code]) => code),
    };
  }

  // Roles CRUD
  createRole(data: Partial<Role>) {
    const role = this.roleRepo.create(data);
    return this.roleRepo.save(role);
  }
  findRoles() {
    return this.roleRepo.find();
  }
  async updateRole(id: string, data: Partial<Role>) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    Object.assign(role, data);
    return this.roleRepo.save(role);
  }
  async deleteRole(id: string) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    await this.roleRepo.remove(role);
    return { success: true };
  }

  // Assign/revoke role permissions
  async setRolePermissions(roleId: string, permissionCodes: string[]) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');
    // preload requested permissions to ensure codes are valid
    await this.permRepo.find({ where: { code: In(permissionCodes) } });
    // mark others as false and provided as true
    const allPerms = await this.permRepo.find();
    for (const p of allPerms) {
      const existing = await this.rolePermRepo.findOne({
        where: { role: { id: role.id }, permission: { id: p.id } },
      });
      const allowed = permissionCodes.includes(p.code);
      if (existing) {
        if (existing.allowed !== allowed) {
          existing.allowed = allowed;
          await this.rolePermRepo.save(existing);
        }
      } else {
        await this.rolePermRepo.save(
          this.rolePermRepo.create({ role, permission: p, allowed }),
        );
      }
    }
    return { success: true };
  }

  // User overrides CRUD
  async setUserOverrides(
    userId: string,
    overrides: { code: string; allowed: boolean }[],
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const codes = overrides.map((o) => o.code);
    const perms = await this.permRepo.find({ where: { code: In(codes) } });
    for (const p of perms) {
      const desired = overrides.find((o) => o.code === p.code);
      if (!desired) continue;
      const existing = await this.userOverrideRepo.findOne({
        where: { user: { id: user.id }, permission: { id: p.id } },
      });
      if (existing) {
        if (existing.allowed !== desired.allowed) {
          existing.allowed = desired.allowed;
          await this.userOverrideRepo.save(existing);
        }
      } else {
        await this.userOverrideRepo.save(
          this.userOverrideRepo.create({
            user,
            permission: p,
            allowed: desired.allowed,
          }),
        );
      }
    }
    return { success: true };
  }

  async setUserRole(userId: string, roleId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    user.role.id = roleId;
    await this.userRepo.save(user);
    return { success: true };
  }
}
