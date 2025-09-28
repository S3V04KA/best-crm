import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/entities/permission.entity';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Injectable()
export class SeedAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedAdminService.name);
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

    const adminRole = await this.roleRepo
      .findOne({ where: { code: 'admin' } })
      .then(
        (r) =>
          r ||
          this.roleRepo.save(
            this.roleRepo.create({ code: 'admin', name: 'Administrator' }),
          ),
      );

    const perms = await this.permRepo.find({
      where: { code: In(permissionCodes) },
    });

    for (const p of perms) {
      const exists = await this.rolePermRepo.findOne({
        where: { role: { id: adminRole.id }, permission: { id: p.id } },
      });
      if (!exists)
        await this.rolePermRepo.save(
          this.rolePermRepo.create({
            role: adminRole,
            permission: p,
            allowed: true,
          }),
        );
    }
  }
}
