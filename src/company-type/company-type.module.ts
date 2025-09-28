import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyType } from '../entities/company-type.entity';
import { CompanyTypeService } from './company-type.service';
import { CompanyTypeController } from './company-type.controller';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      CompanyType,
      Permission,
      RolePermission,
      UserPermissionOverride,
      User,
    ]),
  ],
  controllers: [CompanyTypeController],
  providers: [CompanyTypeService, PermissionsGuard],
})
export class CompanyTypeModule {}
