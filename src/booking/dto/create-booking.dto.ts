import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class CreateBookingDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    bookingUserId: string

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
