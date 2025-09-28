import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { CompanyTypeService } from './company-type.service';
import { Permissions } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionCodes } from 'src/acl/enums/permission-codes';
import { permission } from 'process';

class CreateCompanyTypeDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;
}

class UpdateCompanyTypeDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;
}

@ApiTags('Company Types')
@ApiBearerAuth()
@Controller('company-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompanyTypeController {
  constructor(private readonly service: CompanyTypeService) {}

  @Post()
  @Permissions(PermissionCodes.companyTypeCreate)
  @ApiOperation({ summary: 'Create company type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'b2b' },
        name: { type: 'string', example: 'B2B' },
      },
      required: ['code', 'name'],
    },
  })
  create(@Body() dto: CreateCompanyTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  @Permissions(PermissionCodes.companyTypeRead)
  @ApiOkResponse({
    description: 'List of company types',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          code: { type: 'string', example: 'b2b' },
          name: { type: 'string', example: 'B2B' },
          createdAt: { type: 'string', example: '2025-09-18T10:00:00.000Z' },
          updatedAt: { type: 'string', example: '2025-09-18T10:00:00.000Z' },
        },
      },
    },
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions(PermissionCodes.companyTypeRead)
  @ApiOkResponse({
    description: 'Company type by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        code: { type: 'string', example: 'b2b' },
        name: { type: 'string', example: 'B2B' },
        createdAt: { type: 'string', example: '2025-09-18T10:00:00.000Z' },
        updatedAt: { type: 'string', example: '2025-09-18T10:00:00.000Z' },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permissions(PermissionCodes.companyTypeUpdate)
  @ApiOperation({ summary: 'Update company type' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'b2c' },
        name: { type: 'string', example: 'B2C' },
      },
    },
  })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PermissionCodes.companyTypeDelete)
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
    return this.service.softDelete(id);
  }
}
