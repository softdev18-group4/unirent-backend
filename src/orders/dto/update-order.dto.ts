import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty()
  @IsOptional()
  rentalId?: string;

  @ApiProperty()
  @IsOptional()
  status?: string;

  @ApiProperty()
  @IsOptional()
  rentTime?: number;

  @ApiProperty()
  @IsOptional()
  amount?: number;

  @ApiProperty()
  @IsOptional()
  transactionId?: string;
}
