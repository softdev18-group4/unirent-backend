import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  rentalId?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  rentTime?: number;
}
