import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/entities/permission.entity';
import { PermissionCodes } from 'src/acl/enums/permission-codes';

@Injectable()
export class SeedPermsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedPermsService.name);
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const permissionCodes = Object.values(PermissionCodes);

    const existingPerms = await this.permRepo.find({
      where: { code: In(permissionCodes) },
    });
    const codes: ReadonlyArray<string> = existingPerms.map((p) => p.code);
    const existingCodes = new Set<string>(codes);
    const toCreate = permissionCodes
      .filter((c) => !existingCodes.has(c))
      .map((code) => this.permRepo.create({ code }));
    if (toCreate.length) await this.permRepo.save(toCreate);

    this.logger.log('Permissions seeded');
  }
}
