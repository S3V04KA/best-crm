import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { CallType, LeadStatus } from 'src/entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ example: 'lead@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-1234' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'example.com' })
  @IsString()
  @IsOptional()
  site?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Interested in product X' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional({ example: 'uuid-of-company-type' })
  @IsUUID()
  companyTypeId: string;
}

export class UpdateLeadDto extends CreateLeadDto { }

export class UpdateStatusDto {
  @ApiProperty({ example: 'lead@example.com', nullable: true }) email?: string;
  @ApiProperty({ example: '+1-555-1234', nullable: true }) phoneNumber?: string;
  @ApiProperty({ example: 'Interested in product X', nullable: true }) comment?: string;
  @ApiProperty({ example: 'example.com', nullable: true }) site?: string;
  @ApiProperty({ enum: LeadStatus, nullable: true }) status?: LeadStatus;
  @ApiProperty({ enum: CallType, nullable: true }) callType?: CallType;
}

export class LeadResponseDto {
  @ApiProperty({ example: 'uuid' }) id!: string;
  @ApiProperty({ example: 'lead@example.com' }) email?: string;
  @ApiPropertyOptional({ example: '+1-555-1234' }) phoneNumber?: string;
  @ApiPropertyOptional({ example: 'example.com' }) site?: string;
  @ApiPropertyOptional({ example: 'John Doe' }) name?: string;
  @ApiPropertyOptional({ example: 'Interested in product X' }) comment?: string;
  @ApiPropertyOptional({ enum: LeadStatus }) status?: LeadStatus
  @ApiPropertyOptional({ enum: CallType }) callType?: CallType
  @ApiPropertyOptional({
    example: {
      id: 'uuid',
      code: 'b2b',
      name: 'B2B',
    },
    nullable: true,
  })
  companyType?: unknown;
  @ApiProperty({ example: '2025-09-18T10:00:00.000Z' }) createdAt!: string;
  @ApiProperty({ example: '2025-09-18T10:00:00.000Z' }) updatedAt!: string;
}

