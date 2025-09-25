import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from 'src/entities/workspace.entity';
import { UserWorkspaceOverride } from 'src/entities/workspace-user-override.entity';
import { User } from 'src/entities/user.entity';
import { Permission } from 'src/entities/permission.entity';
import { RolePermission } from 'src/entities/role-permission.entity';
import { UserPermissionOverride } from 'src/entities/user-permission-override.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      RolePermission,
      UserPermissionOverride,
      User,
      Workspace,
      UserWorkspaceOverride
    ]),
  ],
  providers: [WorkspaceService],
  controllers: [WorkspaceController]
})
export class WorkspaceModule { }
