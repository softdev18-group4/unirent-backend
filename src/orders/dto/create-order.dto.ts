import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  isJSON,
  isString,
  isNumber,
} from 'class-validator';

export class CreateOrderDto {
  // productId: string;

  // userId: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rentalId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  rentTime: number;

}
