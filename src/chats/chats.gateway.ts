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

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatsService) {}

  handleConnection(socket: Socket): any {
    console.log(`On connect called... ${socket.id}`);
  }

  @SubscribeMessage('create_chat')
  async createChat(@MessageBody() data: CreateChatDto) {
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
  sendMessage(
    @MessageBody() message: { message: string; chatId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    socket
      .to(message.chatId.toString())
      .emit('receive_message', message.message);

    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);
  }
}
