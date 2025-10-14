import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from '../auth/roles.decorator';
import { WorkspaceService } from './workspace.service';
import {
  CreateWorkspaceDto,
  ResponseFullWorkspaceDto,
  ResponseWorkspaceDto,
  UpdatePS,
} from './dto/workspace.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { WorkspaceGuard } from 'src/auth/workspace.guard';
import { RolePermission } from 'src/entities/role-permission.entity';
import { getJsonSchema } from 'src/utils/swagger.helper';

@ApiTags('Workspace')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  @Get('')
  @ApiOkResponse({
    type: ResponseWorkspaceDto,
    isArray: true,
  })
  @Permissions(PermissionCodes.workspaceManage)
  async listAll(): Promise<ResponseWorkspaceDto[]> {
    return await this.service.listAllWorkspaces();
  }

  @Get('me')
  @ApiOkResponse({
    type: ResponseWorkspaceDto,
    isArray: true,
  })
  @Permissions(PermissionCodes.workspaceRead)
  async listMine(
    @Req() req: { user: { userId: string; rolePermissions: RolePermission[] } },
  ): Promise<ResponseWorkspaceDto[]> {
    if (
      req.user.rolePermissions.find(
        (rp) =>
          rp.permission.code === PermissionCodes.workspaceManage && rp.allowed,
      )
    ) {
      return this.service.listAllWorkspaces();
    }

    return this.service.listCurrntUserWorkspaces(req.user.userId);
  }

  @Get(':workspaceId')
  @ApiOkResponse({
    type: ResponseWorkspaceDto,
  })
  @UseGuards(WorkspaceGuard)
  @Permissions(PermissionCodes.workspaceRead)
  async getWorkspace(@Param('workspaceId') id: string) {
    return this.service.find(id);
  }

  @Get(':workspaceId/users')
  @ApiOkResponse({
    type: ResponseWorkspaceDto,
  })
  @UseGuards(WorkspaceGuard)
  @Permissions(PermissionCodes.workspaceRead)
  async getWorkspaceUsers(@Param('workspaceId') id: string) {
    return this.service.findUsers(id);
  }

  @Post('')
  @ApiOkResponse({
    type: ResponseFullWorkspaceDto,
  })
  @Permissions(PermissionCodes.workspaceCreate)
  async create(
    @Req() req: { user: { userId: string } },
    @Body() data: CreateWorkspaceDto,
  ) {
    const workspace = await this.service.createWorkspace({ name: data.name });
    await this.service.addUserToWorkspace(workspace.id, req.user.userId);
    return workspace;
  }

  @Patch(':workspaceId/user/:userId')
  @Permissions(PermissionCodes.workspaceUpdate)
  @UseGuards(WorkspaceGuard)
  async addUser(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.addUserToWorkspace(workspaceId, userId);
  }

  @Patch(':workspaceId/ps')
  @Permissions(PermissionCodes.workspaceUpdate)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(WorkspaceGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ...getJsonSchema(UpdatePS).properties,
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updatePS(
    @Param('workspaceId') id: string,
    @Body() data: Partial<UpdatePS>,
    @UploadedFile() file?: any,
  ) {
    return this.service.updatePS(id, data, file);
  }

  @Delete(':id')
  @Permissions(PermissionCodes.workspaceDelete)
  delete(@Param('id') id: string) {
    return this.service.deleteWorkspace(id);
  }
}
