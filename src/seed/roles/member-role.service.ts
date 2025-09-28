import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/entities/permission.entity';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Injectable()
export class SeedMemberService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedMemberService.name);
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const permissionCodes = Object.values(PermissionCodes);

    const perms = await this.permRepo.find({
      where: { code: In(permissionCodes) },
    });

    const memberRole = await this.roleRepo
      .findOne({ where: { code: 'member' } })
      .then(
        (r) =>
          r ||
          this.roleRepo.save(
            this.roleRepo.create({ code: 'member', name: 'Member' }),
          ),
      );

    const memberAllowed: ReadonlySet<string> = new Set<string>([
      PermissionCodes.leadRead,
      PermissionCodes.leadStatus,
      PermissionCodes.companyTypeRead,
      PermissionCodes.workspaceRead,
      PermissionCodes.aclRead,
      PermissionCodes.mailSend,
    ]);
    for (const p of perms) {
      const exists = await this.rolePermRepo.findOne({
        where: { role: { id: memberRole.id }, permission: { id: p.id } },
      });
      if (!exists)
        await this.rolePermRepo.save(
          this.rolePermRepo.create({
            role: memberRole,
            permission: p,
            allowed: memberAllowed.has((p as Permission).code),
          }),
        );
    }
  }
}
