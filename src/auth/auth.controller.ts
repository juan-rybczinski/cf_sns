import {
  Body,
  Controller,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MaxLengthPipe, MinLengthPipe } from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginByEmail(@Headers('Authorization') rawToken: string, @Request() req) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterByEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body(
      'password',
      new MinLengthPipe('비밀번호', 3),
      new MaxLengthPipe('비밀번호', 8),
    )
    password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
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
