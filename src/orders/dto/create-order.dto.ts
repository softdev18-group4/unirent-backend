import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    IsArray,
    isJSON,
    isString,
} from 'class-validator';

export class CreateOrderDto {
    productId: string;

    userId: string;

    rentalId: string;
}
