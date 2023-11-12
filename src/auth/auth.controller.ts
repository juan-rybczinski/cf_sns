import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginByEmail(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterByEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return {
      accessToken: this.authService.rotateToken(token, false),
    };
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postRefreshAccess(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return {
      refreshToken: this.authService.rotateToken(token, true),
    };
  }
}
