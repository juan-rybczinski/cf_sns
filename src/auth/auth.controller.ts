import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/email')
  loginByEmail(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.loginWithEmail({
      email,
      password,
    });
  }

  @Post('/register/email')
  registerByEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }
}
