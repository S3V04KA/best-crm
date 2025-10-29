import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Permissions } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { LeadResponseDto } from './dto/lead.dto';
import { CsvImportResponseDto } from './dto/csv-import.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('import-csv')
  @Permissions(PermissionCodes.leadManage)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        workspaceId: {
          type: 'string',
          description: 'UUID of the workspace',
        },
      },
      required: ['file', 'workspaceId'],
    },
  })
  @ApiOkResponse({
    description: 'CSV import result',
    type: CsvImportResponseDto,
  })
  async importCsv(
    @UploadedFile() file: any,
    @Body('workspaceId') workspaceId: string,
  ): Promise<CsvImportResponseDto> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new Error('File must be a CSV file');
    }

    const csvContent = file.buffer.toString('utf-8');
    return this.leadsService.importFromCsv(csvContent, workspaceId);
  }
}
