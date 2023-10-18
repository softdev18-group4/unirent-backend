import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rentalId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  rentTime: number;
}
