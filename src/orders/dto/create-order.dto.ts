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
  @IsString()
  @IsNotEmpty()
  rentalId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsInt()
  @IsNotEmpty()
  rentTime: number;
}
