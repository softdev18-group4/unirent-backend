import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';
import { IsDate, IsOptional, IsString, IsInt } from 'class-validator';
import { User } from '@prisma/client';

export class UpdateCouponDto {

    @ApiProperty()
    @IsOptional()
    expireDate?: Date;

    @ApiProperty()
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    discount?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    amount?: number

    @ApiProperty()
    @IsOptional()
    userAlreadyUsed?: string[]
}
