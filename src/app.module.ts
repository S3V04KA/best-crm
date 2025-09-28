import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { CompanyTypeModule } from './company-type/company-type.module';
import { SeedModule } from './seed/seed.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserPermissionOverride } from './entities/user-permission-override.entity';
import { CompanyType } from './entities/company-type.entity';
import { Lead } from './entities/lead.entity';
import { ACLModule } from './acl/acl.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { Workspace } from './entities/workspace.entity';
import { UserWorkspaceOverride } from './entities/workspace-user-override.entity';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'best_crm',
      entities: [
        User,
        Role,
        Permission,
        RolePermission,
        UserPermissionOverride,
        CompanyType,
        Lead,
        Workspace,
        UserWorkspaceOverride,
      ],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      RolePermission,
      UserPermissionOverride,
      CompanyType,
      Lead,
      Workspace,
      UserWorkspaceOverride,
    ]),
    AuthModule,
    LeadsModule,
    CompanyTypeModule,
    SeedModule,
    ACLModule,
    UsersModule,
    MailModule,
    WorkspaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
