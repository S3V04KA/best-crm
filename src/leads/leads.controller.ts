import { Controller, Get, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { LeadResponseDto } from './dto/lead.dto';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('')
  @Permissions(
    PermissionCodes.leadRead,
    PermissionCodes.leadManage,
    PermissionCodes.leadFullRead,
  )
  @ApiOkResponse({
    description: 'List of leads',
    type: LeadResponseDto,
    isArray: true,
  })
  getAllLeads() {
    return this.leadsService.findAll();
  }
}
