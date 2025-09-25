import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendProposalDto {
  @ApiProperty({ example: 'Коммерческое предложение', nullable: true })
  @IsString()
  subject?: string;
}
