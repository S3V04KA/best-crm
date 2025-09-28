import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { User } from '../entities/user.entity';
import { ACLController } from './acl.controller';
import { ACLService } from './acl.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      UserPermissionOverride,
      User,
    ]),
  ],
  controllers: [ACLController],
  providers: [ACLService, JwtAuthGuard, PermissionsGuard],
})
export class ACLModule {}
