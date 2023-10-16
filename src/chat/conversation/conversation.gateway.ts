import { UsersService } from '@/users/users.service';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import { SocketAuthMiddleware } from '@/common/middlewares/ws-auth.middleware';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '@/common/guards/ws-jwt.guard';
import { ConversationService } from './conversation.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageService } from '../message/message.service';
import { ConversationDto } from '../dto/conversation.dto';
import { MessageSeenDto } from '../dto/message-seen.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard)
export class ConversationGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware(this.authService) as any);
    console.log('Init!');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const token = client.handshake.auth.token;
    const decodedToken = await this.authService.verifyToken(token);
    const user = await this.userService.findById(decodedToken.sub as string);
    if (!user) {
      console.log('Invalid User.');
      return client.disconnect();
    }
    
    client.data.user = user;
    const conversations = await this.conversationService.getConversationByUser(user, 1, 10);

    // Only emit conversation to the specific connected client
    return this.server.to(client.id).emit('conversations', conversations);
  }

  async handleDisconnect(client: Socket) {
    client.disconnect();
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('paginateConversation')
  async handlePaginateConversation(
    clinet: Socket,
    page: number,
    perPage: number,
  ) {
    perPage = perPage > 100 ? 100 : perPage;
    const conversations = await this.conversationService.getConversationByUser(
      clinet.data.user,
      page,
      perPage,
    );
    return this.server.to(clinet.id).emit('conversations', conversations);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, payload: ConversationDto) {
    try {
      client.join(payload.conversationId);
      console.log(`${client.id} join conversation ${payload.conversationId}`);

      const messages = await this.messageService.getMessagesByConversation(
        payload.conversationId,
      );
      
      // Send messages in Conversation to User that joined 
      await this.server.to(client.id).emit('messages', messages);
    } catch (error) {
      throw new WsException(error?.message);
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(client: Socket, payload: ConversationDto) {
    client.leave(payload.conversationId)
    console.log(`${client.id} leave conversation ${payload.conversationId}`);
  }

  @SubscribeMessage('messageToServer')
  async handleNewMessage(client: Socket, payload: CreateMessageDto) {
    try {
      const createdMessage = await this.messageService.createMessage(
        client.data.user,
        payload,
      );
      
      // Send new Message to all joined Users of the conversation (currently online)
      await this.server.to(payload.conversationId).emit('messageToClient', createdMessage);

    } catch (error) {
      throw new WsException(error?.message);
    }
  }

  @SubscribeMessage('messageSeen')
  async handleMessageSeen(client: Socket, payload: MessageSeenDto) {
    try {
      const message = await this.messageService.markMessageAsSeen(payload);
      this.server.emit('messageSeen', message);
    } catch (error) {
      throw new WsException(error?.message);
    }
  }
}
