import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { UserWorkspaceOverride } from 'src/entities/workspace-user-override.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    @InjectRepository(UserWorkspaceOverride)
    private readonly workspaceOvverideRepo: Repository<UserWorkspaceOverride>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const workspaceId = req.params.workspaceId;
    const userId = req.user.userId;
    const rolePermissions = req.user.rolePermissions;

    const rolePerm = rolePermissions.find(
      (rp) => rp.permission.code === PermissionCodes.workspaceManage,
    );
    if (rolePerm && rolePerm.allowed) return true;

    if (!workspaceId) return true;

    if (!userId) return false;

    const relation = await this.workspaceOvverideRepo.findOne({
      where: { user: { id: userId }, workspace: { id: workspaceId } },
    });

    if (!relation) return false;

    return true;
  }
}
