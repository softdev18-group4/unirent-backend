import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateReviewDto {
    @IsString()
    @IsOptional()
    text: string;

    @IsNotEmpty()
    @IsNumber()
    rating: number;
}
