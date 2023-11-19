import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketExceptionFilter } from './filter/socket-exception.filter';
import { SocketBearerTokenGuard } from '../auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly messageService: MessagesService,
  ) {}

  handleConnection(socket: Socket): any {
    console.log(`On connect called... ${socket.id}`);
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
  @UseGuards(SocketBearerTokenGuard)
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatService.createChat(data);
  }

  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
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
  async sendMessage(
    @MessageBody() dto: CreateMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chatExists = await this.chatService.checkIfChatExists(dto.chatId);

    if (!chatExists) {
      throw new WsException({
        code: 100,
        message: `존재하지 않는 채팅방입니다! ::: ChatID: ${dto.chatId}`,
      });
    }

    const message = await this.messageService.createMessage(dto);

    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);

    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);
  }
}
