import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Permission } from 'src/entities/permission.entity';
import { UserPermissionOverride } from 'src/entities/user-permission-override.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Permission,
      UserPermissionOverride,
      RolePermission,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
