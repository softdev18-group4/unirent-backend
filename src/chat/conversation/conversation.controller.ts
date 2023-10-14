import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { GetUser } from '@/common/decorators/get-users.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { User } from '@prisma/client';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@ApiTags('conversations')
@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  async getAll() {
    return this.conversationService.getAllConversation();
  }

  @Get('/user/:id')
  async getById(@Param('id') id: string) {
    return this.conversationService.getConversation(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('/user')
  async getByUser(
    @GetUser() currentUser: User,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ) {
    perPage = perPage > 100 ? 100 : perPage;
    return this.conversationService.getConversationByUser(
      currentUser,
      page,
      perPage,
    );
  }

  @Get('/:id/users')
  async getUser(@Param('id') id: string) {
    return this.conversationService.getUsersByConversation(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @GetUser() currentUser: User,
  ) {
    return this.conversationService.createConversation(
      createConversationDto,
      currentUser,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.conversationService.deleteConversation(id);
  }

  @Get('/:conversationId/message')
  async getMessage(@Param('conversationId') conversationId: string) {
    return await this.messageService.getMessagesByConversation(conversationId);
  }

  @Post('/message')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @GetUser() currentUser: User,
  ) {
    console.log(currentUser);
    return await this.messageService.createMessage(
      currentUser,
      createMessageDto,
    );
  }
}
