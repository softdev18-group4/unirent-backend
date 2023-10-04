import { ApiProperty } from '@nestjs/swagger';
import { Specifications } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  specifications: Specifications;

  @ApiProperty()
  @IsNotEmpty()
  rentalOptions: RentalOptions[];

  @ApiProperty()
  @IsNotEmpty()
  availableDays: {
    startDate: Date;

    endDate: Date;
  };
}

export class Specification {
  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsString()
  processor: string;

  @ApiProperty()
  @IsString()
  graphicCard: string;

  @ApiProperty()
  @IsInt()
  ramSize: number;

  @ApiProperty()
  @IsInt()
  storageSize: number;
}

export class RentalOptions {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsInt()
  priceRate: number;

  isSelected: true;
}
