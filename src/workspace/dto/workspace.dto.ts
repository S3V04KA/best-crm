import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class WorkspaceDto {
  @ApiProperty({ example: 'Test Workspace' })
  @IsString()
  name: string;
}

export class CreateWorkspaceDto extends WorkspaceDto {}

export class ResponseWorkspaceDto extends WorkspaceDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}

export class UpdatePS {
  @ApiProperty({ example: 'Abhdishba' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({ example: 'Abhdishba' })
  @IsString()
  @IsOptional()
  html?: string;
}

export class ResponseFullWorkspaceDto extends ResponseWorkspaceDto {
  @ApiProperty()
  @IsDate()
  createdAt!: Date;

  @ApiProperty()
  @IsDate()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  @IsDate()
  deletedAt?: Date;
}
