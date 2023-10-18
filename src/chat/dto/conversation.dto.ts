import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConversationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  conversationId: string;
}
