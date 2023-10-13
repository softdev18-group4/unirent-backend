import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { GetUser } from '@/common/decorators/get-users.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('conversations')
@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async getAll() {
    return this.conversationService.getAllConversation();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.conversationService.getConversation(id);
  }

  @Get('/user/:id')
  async getByUser(@Param('id') id: string) {
    return this.conversationService.getConversationByUser(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @GetUser() currentUser,
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
}
