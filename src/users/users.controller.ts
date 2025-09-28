import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/roles.decorator';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { UserDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({
    type: UserDto,
  })
  me(@Req() req: { user: { userId: string } }) {
    return this.usersService.getById(req.user.userId);
  }

  @Get('')
  @Permissions(PermissionCodes.usersManage)
  @ApiOkResponse({
    type: UserDto,
    isArray: true,
  })
  getAllUsers() {
    return this.usersService.getAll();
  }
}
