import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CsvImportRowDto {
  @ApiProperty({ example: 'ООО "Рога и копыта"' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: 'https://example.com', nullable: true })
  @IsString()
  @IsOptional()
  companyWebsite?: string;

  @ApiProperty({ example: '+7 (999) 123-45-67', nullable: true })
  @IsString()
  @IsOptional()
  companyPhone?: string;

  @ApiProperty({ example: 'info@example.com', nullable: true })
  @IsEmail()
  @IsOptional()
  companyEmail?: string;
}

export class CsvImportResponseDto {
  @ApiProperty({ example: 10 })
  totalRows!: number;

  @ApiProperty({ example: 8 })
  successCount!: number;

  @ApiProperty({ example: 2 })
  errorCount!: number;

  @ApiProperty({
    example: ['Row 3: Invalid email format', 'Row 7: Missing company name'],
  })
  errors!: string[];

  @ApiProperty({ example: ['uuid1', 'uuid2', 'uuid3'] })
  createdLeadIds!: string[];
}
