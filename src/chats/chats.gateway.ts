import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';

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
  enterChat(@MessageBody() data: number[], @ConnectedSocket() socket: Socket) {
    for (const chatId of data) {
      socket.join(chatId.toString());
    }
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
