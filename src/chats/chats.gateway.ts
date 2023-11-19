import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessageDto } from './messages/dto/create-message.dto';
import { MessagesService } from './messages/messages.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketExceptionFilter } from './filter/socket-exception.filter';
import { UsersModel } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import * as console from 'console';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly messageService: MessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`On connect called... ${socket.id}`);

    const rawToken = socket.handshake.headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      socket.user = await this.usersService.getUserByEmail(payload.email);

      return true;
    } catch (e) {
      socket.disconnect();
    }
  }

  @SubscribeMessage('create_chat')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketExceptionFilter)
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatService.createChat(data);
  }

  @SubscribeMessage('enter_chat')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketExceptionFilter)
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    for (const chatId of data.chatIds) {
      const exists = await this.chatService.checkIfChatExists(chatId);
      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 채팅방입니다! ::: ChatID: ${chatId}`,
        });
      }
    }
    socket.join(data.chatIds.map((id) => id.toString()));
  }

  @SubscribeMessage('send_message')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketExceptionFilter)
  async sendMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatService.checkIfChatExists(dto.chatId);

    if (!chatExists) {
      throw new WsException({
        code: 100,
        message: `존재하지 않는 채팅방입니다! ::: ChatID: ${dto.chatId}`,
      });
    }

    const message = await this.messageService.createMessage(
      dto,
      socket.user.id,
    );

    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);

    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);
  }

  afterInit(server: Server): any {
    console.log(`After gateway init...}`);
  }

  handleDisconnect(socket: Socket): any {
    console.log(`On disconnect called... ${socket.id}`);
  }
}
