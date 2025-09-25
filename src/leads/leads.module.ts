import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../entities/lead.entity';
import { CompanyType } from '../entities/company-type.entity';
import { LeadsService } from './leads.service';
import { LeadsWorkspaceController } from './leads-workspace.controller';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { UserWorkspaceOverride } from 'src/entities/workspace-user-override.entity';
import { LeadsController } from './leads.controller';

@Module({
  imports: [
    PassportModule,
    MailModule,
    TypeOrmModule.forFeature([
      Lead,
      CompanyType,
      Permission,
      RolePermission,
      UserPermissionOverride,
      User,
      UserWorkspaceOverride,
    ]),
  ],
  controllers: [LeadsWorkspaceController, LeadsController],
  providers: [LeadsService, PermissionsGuard],
})
export class LeadsModule { }
