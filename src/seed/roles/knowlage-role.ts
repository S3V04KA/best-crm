import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/entities/permission.entity';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Injectable()
export class SeedKnowlageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedKnowlageService.name);
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

    const knowlageRole = await this.roleRepo
      .findOne({ where: { code: 'knowlage' } })
      .then(
        (r) =>
          r ||
          this.roleRepo.save(
            this.roleRepo.create({ code: 'knowlage', name: 'Knowlage' }),
          ),
      );

    const KnowlageAllowed: ReadonlySet<string> = new Set<string>([
      PermissionCodes.leadCreate,
      PermissionCodes.leadRead,
      PermissionCodes.leadFullRead,
      PermissionCodes.leadManage,
      PermissionCodes.leadUpdate,
      PermissionCodes.leadDelete,
      PermissionCodes.leadStatus,
      PermissionCodes.usersManage,
      PermissionCodes.companyTypeRead,
      PermissionCodes.companyTypeCreate,
      PermissionCodes.companyTypeDelete,
      PermissionCodes.companyTypeUpdate,
      PermissionCodes.workspaceCreate,
      PermissionCodes.workspaceRead,
      PermissionCodes.workspaceUpdate,
      PermissionCodes.workspaceDelete,
      PermissionCodes.workspaceManage,
      PermissionCodes.aclRead,
      PermissionCodes.mailSend,
    ]);
    for (const p of perms) {
      const exists = await this.rolePermRepo.findOne({
        where: { role: { id: knowlageRole.id }, permission: { id: p.id } },
      });
      if (!exists)
        await this.rolePermRepo.save(
          this.rolePermRepo.create({
            role: knowlageRole,
            permission: p,
            allowed: KnowlageAllowed.has((p as Permission).code),
          }),
        );
    }
  }
}
