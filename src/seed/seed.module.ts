import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { SeedPermsService } from './roles/perms.service';
import { SeedAdminService } from './roles/admin-role.service';
import { SeedVP4CRService } from './roles/vp4cr-role.service';
import { SeedRespService } from './roles/resp-role.service';
import { SeedMemberService } from './roles/member-role.service';
import { SeedKnowlageService } from './roles/knowlage-role';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [
    SeedPermsService,
    SeedAdminService,
    SeedVP4CRService,
    SeedRespService,
    SeedMemberService,
    SeedKnowlageService,
  ],
})
export class SeedModule {}
