import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageSeenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  messageId: string;
}
