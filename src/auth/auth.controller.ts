import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from '../common/decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginByEmail(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @IsPublic()
  @Post('register/email')
  postRegisterByEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @IsPublic()
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return {
      accessToken: this.authService.rotateToken(token, false),
    };
  }

  @IsPublic()
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postRefreshAccess(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return {
      refreshToken: this.authService.rotateToken(token, true),
    };
  }
}
