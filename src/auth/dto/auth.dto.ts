import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  code!: string;
}

export class SendCodeDto {
  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email!: string;
}

export class AuthTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;
}
