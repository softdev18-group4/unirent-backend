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
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '@/common/guards/ws-jwt.guard';
import { ConversationService } from './conversation.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ConnectedUserService } from '../connected-user/connected-user.service';
import { JoinedConversationService } from '../joined-conversation/joined-conversation.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
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
    OnGatewayInit,
    OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private conversationService: ConversationService,
    private connectedUserService: ConnectedUserService,
    private joindConversationService: JoinedConversationService,
    private messageService: MessageService,
  ) {}

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware(this.authService) as any);
    console.log('Init!');
  }

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joindConversationService.deleteAll();
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
    const conversations = await this.conversationService.getConversationByUser(
      user,
      1,
      10,
    );

    // Save connection to db
    await this.connectedUserService.create(client.id, user);

    // Only emit conversation to the specific connected client
    return this.server.to(client.id).emit('conversations', conversations);
  }

  async handleDisconnect(client: Socket) {
    // remove connection from db
    await this.connectedUserService.deleteBySocketId(client.id);
    client.disconnect();
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('paginateConversation')
  async handlePaginateConversation(clinet: Socket, page: number, perPage: number) {
    perPage = perPage > 100 ? 100 : perPage;
    const conversations = await this.conversationService.getConversationByUser(
      clinet.data.user,
      page,
      perPage,
    );
    return this.server.to(clinet.id).emit('conversations', conversations);
  }

  // sendMessage(createMessageDto: CreateMessageDto) {
  //   this.server.emit('newMessage', createMessageDto);
  // }

  @SubscribeMessage('createConversation')
  async handleCreateConversation(
    client: Socket,
    payload: CreateConversationDto,
  ) {
    const createdConversation =
      await this.conversationService.createConversation(
        payload,
        client.data.user,
      );
    if (!createdConversation) {
      const conversations =
        await this.conversationService.getConversationByUser(
          client.data.user,
          1,
          10,
        );
      await this.server.to(client.id).emit('conversation', conversations);
      return this.server
        .to(client.id)
        .emit('error', 'Conversation already exist.');
    }

    for (const userId of createdConversation.participants) {
      const connections = await this.connectedUserService.findByUser(userId);
      const user = await this.userService.findById(userId);
      const conversations =
        await this.conversationService.getConversationByUser(user, 1, 10);
      for (const connection of connections) {
        await this.server
          .to(connection.socketId)
          .emit('conversation', conversations);
      }
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, payload: ConversationDto) {
    try {
      const messages = await this.messageService.getMessagesByConversation(payload.conversationId);

      // Save Connection to Room
      await this.joindConversationService.create({ socketId: client.id, conversationId: payload.conversationId }, client.data.user);
      // Send last messages from Conversation to User
      await this.server.to(client.id).emit('messages', messages);

    } catch (error) {
      throw new WsException(error?.message);
    }
  }

  @SubscribeMessage('leaveConversation')
  async onLeaveConversation(client: Socket) {
    // Remove Connection from Joined Conversation
    await this.joindConversationService.deleteBySocketId(client.id);
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(client: Socket, payload: CreateMessageDto) {
    try {
      const createdMessage = await this.messageService.createMessage(client.data.user, payload);
      const conversation = await this.conversationService.getConversation(createdMessage.conversationId);
      const joinedUsers = await this.joindConversationService.findByConversation(conversation.id);
      // Send new Message to all joined Users of the conversation (currently online) 
      for (const user of joinedUsers) {
        await this.server.to(user.socketId).emit('newMessage', createdMessage);
      }
    } catch (error) {
      throw new WsException(error?.message);
    }
  }

  @SubscribeMessage('messageSeen')
  async handleMessageSeen(client: Socket, payload: MessageSeenDto) {
    try {
      const message = await this.messageService.markMessageAsSeen(payload)
      this.server.emit('messageSeen', message);
    } catch (error) {
      throw new WsException(error?.message);
    }
  }
}
