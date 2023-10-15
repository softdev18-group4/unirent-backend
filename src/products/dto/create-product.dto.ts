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
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  imageName: string[];

  @ApiProperty()
  @IsNotEmpty()
  location: string;

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
  @IsString()
  os: string;

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
  priceRate: number;

  isSelected: true;
}
