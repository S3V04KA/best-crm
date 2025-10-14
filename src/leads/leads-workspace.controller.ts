import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Permissions } from 'src/auth/roles.decorator';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Lead } from 'src/entities/lead.entity';
import { CompanyType } from 'src/entities/company-type.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadResponseDto,
  UpdateStatusDto,
} from './dto/lead.dto';
import { SendProposalDto } from './dto/proposal.dto';
import { MailService } from 'src/mail/mail.service';
import { readFile } from 'fs/promises';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { WorkspaceGuard } from 'src/auth/workspace.guard';
import { Workspace } from 'src/entities/workspace.entity';
import { ApiWorkspaceId } from 'src/auth/workspace.decorator';
import { User } from 'src/entities/user.entity';

// swagger helper not needed

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads/:workspaceId')
@ApiWorkspaceId()
@UseGuards(JwtAuthGuard, PermissionsGuard, WorkspaceGuard)
export class LeadsWorkspaceController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly mailService: MailService,
  ) {}

  @Post('')
  @Permissions(PermissionCodes.leadCreate)
  @ApiOperation({ summary: 'Create lead' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateLeadDto,
  ) {
    const data: Partial<Lead> = {
      ...dto,
      companyType: { id: dto.companyTypeId } as unknown as CompanyType,
    } as Partial<Lead>;
    if (!dto.companyTypeId) {
      throw new BadRequestException('');
    }
    data.workspace = { id: workspaceId } as unknown as Workspace;
    return this.leadsService.create(data);
  }

  @Get('')
  @Permissions(PermissionCodes.leadRead, PermissionCodes.leadManage)
  @ApiOkResponse({
    description: 'List of leads',
    type: LeadResponseDto,
    isArray: true,
  })
  findAllFromWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.leadsService.findAllFromWorkspace(workspaceId);
  }

  @Get('me')
  @Permissions(PermissionCodes.leadRead)
  @ApiOkResponse({
    type: LeadResponseDto,
    isArray: true,
  })
  findAllMineFromWorkspace(
    @Req() req: { user: { userId: string } },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.leadsService.findAllMineFromWorkspace(
      workspaceId,
      req.user.userId,
    );
  }

  @Get(':id')
  @Permissions(PermissionCodes.leadRead)
  @ApiOkResponse({ description: 'Lead by id', type: LeadResponseDto })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.leadUpdate)
  @ApiBody({
    type: UpdateLeadDto,
  })
  @ApiOperation({ summary: 'Update lead' })
  update(@Param('id') id: string, @Body() dto: Partial<UpdateLeadDto>) {
    const data: Partial<Lead> = { ...dto } as Partial<Lead>;
    if (dto.companyTypeId) {
      data.companyType = { id: dto.companyTypeId } as unknown as CompanyType;
    }
    if (dto.responsibleId) {
      data.responsible = { id: dto.responsibleId } as unknown as User;
    }
    return this.leadsService.update(id, data);
  }

  @Delete(':id')
  @Permissions(PermissionCodes.leadDelete)
  @ApiOkResponse({
    description: 'Deletion result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.leadsService.softDelete(id);
  }

  @Patch(':id/status')
  @ApiBody({
    type: UpdateStatusDto,
  })
  @Permissions(PermissionCodes.leadStatus)
  changeStatus(@Param('id') id: string, @Body() dto: Partial<UpdateStatusDto>) {
    return this.leadsService.update(id, dto);
  }

  @Post(':id/proposal')
  @Permissions(PermissionCodes.mailSend)
  @ApiOperation({ summary: 'Send cooperation proposal via SMTP' })
  @ApiOkResponse({
    description: 'Result',
    schema: { type: 'object', properties: { messageId: { type: 'string' } } },
  })
  async sendProposal(@Param('id') id: string, @Body() dto: SendProposalDto) {
    // If not provided, default to lead email
    const lead = await this.leadsService.findOneWithWorkspace(id);

    if (!lead.email) {
      throw new BadRequestException('Lead email not found');
    }

    if (!lead.workspace.text && !lead.workspace.html) {
      throw new BadRequestException('Not found text or html');
    }

    const to = lead.email;

    if (!lead.workspace.filename)
      return this.mailService.sendProposal({
        to,
        subject: dto.subject ? dto.subject : 'Комерческое предложение',
        text: lead.workspace.html ? undefined : lead.workspace.text,
        html: lead.workspace.html,
        user: process.env.SMTP_MAIL_USER || '',
        pass: process.env.SMTP_MAIL_PASS || '',
      });

    const file = await readFile(`./data/PS/${lead.workspace.filename}`);

    const attachment = file
      ? { filename: lead.workspace.filename, content: file }
      : undefined;
    return this.mailService.sendProposal({
      to,
      subject: dto.subject ? dto.subject : 'Комерческое предложение',
      text: lead.workspace.html ? undefined : lead.workspace.text,
      html: lead.workspace.html,
      user: process.env.SMTP_MAIL_USER || '',
      pass: process.env.SMTP_MAIL_PASS || '',
      attachment,
    });
  }
}
