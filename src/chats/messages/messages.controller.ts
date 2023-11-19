import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { BasePaginationDto } from '../../common/dto/base-pagination.dto';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  paginateMessage(
    @Param('cid', ParseIntPipe) id: number,
    @Query() dto: BasePaginationDto,
  ) {
    return this.messagesService.paginateMessages(dto, {
      where: {
        chat: {
          id,
        },
      },
      relations: {
        author: true,
        chat: true,
      },
    });
  }
}
