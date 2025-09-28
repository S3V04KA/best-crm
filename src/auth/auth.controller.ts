import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokenResponseDto, LoginDto, RegisterDto, SendCodeDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiCreatedResponse({
    description: 'JWT access token',
    type: AuthTokenResponseDto,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.fullName, dto.email);
  }

  @Post('send_code')
  sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendCode(dto.email);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT' })
  @ApiOkResponse({
    description: 'JWT access token',
    type: AuthTokenResponseDto,
  })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.code);
    return this.authService.login(user);
  }
}
