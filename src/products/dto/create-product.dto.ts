import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsOptional()
    description: string;
    @IsNotEmpty()
    specifications: Specification;
    @IsNotEmpty()
    rentalOptions: RentalOption[];
    @IsNotEmpty()
    availableDays: {
        startDate: Date;
        endDate: Date;
    };
}

export class Specification {
    @IsString()
    brand: string;
    @IsString()
    model: string;
    @IsString()
    processor: string;
    @IsString()
    graphicCard: string;
    @IsInt()
    ramSize: number;
    @IsInt()
    storageSize: number;
}

export class RentalOption {
    @IsString()
    type: string;
    @IsInt()
    priceRate: number;
}
