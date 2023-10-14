import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJoinedConversationDto {
  @IsNotEmpty()
  @IsString()
  socketId: string;

  @IsNotEmpty()
  @IsString()
  conversationId: string;
}
