import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ACLService } from './acl.service';
import { PermissionCodes } from './enums/permission-codes';

class SetRolePermissionsDto {
  @IsArray()
  permissionCodes!: string[];
}

class SetUserOverridesDto {
  @IsArray()
  overrides!: { code: string; allowed: boolean }[];
}

class SetUserRoleDto {
  @ApiProperty()
  @IsUUID()
  roleId: string;
}

@ApiTags('Access Control')
@ApiBearerAuth()
@Controller('acl')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ACLController {
  constructor(private readonly service: ACLService) {}

  @Get('permissions')
  @ApiOperation({ summary: 'List all permissions' })
  @Permissions(PermissionCodes.aclRead)
  listAll() {
    return this.service.listAllPermissions();
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'List current user permissions (role + overrides)' })
  listMine(@Req() req: { user: { userId: string } }) {
    return this.service.listCurrentUserPermissions(req.user.userId);
  }

  @Get('roles')
  @ApiOperation({ summary: 'List roles' })
  @Permissions(PermissionCodes.aclRead)
  listRoles() {
    return this.service.findRoles();
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create role' })
  @Permissions(PermissionCodes.aclManage)
  createRole(@Body() body: { name: string; code: string }) {
    return this.service.createRole(body);
  }

  @Patch('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @Permissions(PermissionCodes.aclManage)
  updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; code?: string },
  ) {
    return this.service.updateRole(id, body);
  }

  @Post('roles/:id/permissions')
  @ApiOperation({ summary: 'Set role permissions by codes' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissionCodes: { type: 'array', items: { type: 'string' } },
      },
      required: ['permissionCodes'],
    },
  })
  @Permissions(PermissionCodes.aclManage)
  setRolePerms(@Param('id') id: string, @Body() body: SetRolePermissionsDto) {
    return this.service.setRolePermissions(id, body.permissionCodes);
  }

  @Post('users/:id/overrides')
  @ApiOperation({ summary: 'Set user permission overrides' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        overrides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              allowed: { type: 'boolean' },
            },
          },
        },
      },
      required: ['overrides'],
    },
  })
  @Permissions(PermissionCodes.aclManage)
  setUserOverrides(@Param('id') id: string, @Body() body: SetUserOverridesDto) {
    return this.service.setUserOverrides(id, body.overrides);
  }

  @Post('users/:userId/role')
  @Permissions(PermissionCodes.aclManage)
  setUserRole(@Param('userId') userId: string, @Body() body: SetUserRoleDto) {
    return this.service.setUserRole(userId, body.roleId);
  }
}
