import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/entities/permission.entity';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Injectable()
export class SeedRespService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedRespService.name);
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
  ) { }

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const permissionCodes = Object.values(PermissionCodes);

    const perms = await this.permRepo.find({
      where: { code: In(permissionCodes) },
    });

    const respRole = await this.roleRepo
      .findOne({ where: { code: 'resp' } })
      .then(
        (r) =>
          r ||
          this.roleRepo.save(
            this.roleRepo.create({ code: 'resp', name: 'Resp' }),
          ),
      );

    const respAllowed: ReadonlySet<string> = new Set<string>([
      PermissionCodes.leadCreate,
      PermissionCodes.leadRead,
      PermissionCodes.leadManage,
      PermissionCodes.leadUpdate,
      PermissionCodes.leadDelete,
      PermissionCodes.leadStatus,
      PermissionCodes.usersManage,
      PermissionCodes.companyTypeRead,
      PermissionCodes.workspaceCreate,
      PermissionCodes.workspaceRead,
      PermissionCodes.workspaceUpdate,
      PermissionCodes.aclRead,
      PermissionCodes.mailSend,
    ]);
    for (const p of perms) {
      const exists = await this.rolePermRepo.findOne({
        where: { role: { id: respRole.id }, permission: { id: p.id } },
      });
      if (!exists)
        await this.rolePermRepo.save(
          this.rolePermRepo.create({
            role: respRole,
            permission: p,
            allowed: respAllowed.has((p as Permission).code),
          }),
        );
    }
  }
}
