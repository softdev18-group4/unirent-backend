import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;
}
