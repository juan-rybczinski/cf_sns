import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../../auth.service';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();
    const rawToken = socket.handshake.headers['authorization'];

    if (!rawToken) {
      throw new WsException('토큰이 없습니다!');
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      socket.user = await this.usersService.getUserByEmail(payload.email);
      socket.token = token;
      socket.tokenType = payload.type;

      return true;
    } catch (e) {
      throw new WsException('토큰이 유효하지 않습니다!');
    }
  }
}
