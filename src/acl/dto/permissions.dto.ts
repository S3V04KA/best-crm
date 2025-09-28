import { ApiProperty } from '@nestjs/swagger';
import { PermissionCodes } from '../enums/permission-codes';

export class PermissionsResponseDto {
  @ApiProperty({ enum: PermissionCodes, isArray: true })
  permissions: PermissionCodes[];
}
