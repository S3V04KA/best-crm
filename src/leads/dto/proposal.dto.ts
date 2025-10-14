import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendProposalDto {
  @ApiProperty({ example: 'Коммерческое предложение', nullable: true })
  @IsString()
  subject?: string;
}
