import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDate,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  expireDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  discount: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  userAlreadyUsed?: string[];
}
