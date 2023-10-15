import { ApiProperty } from '@nestjs/swagger';
import { Specifications } from '@prisma/client';
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsOptional()
  imageName?: string[];

  @ApiProperty()
  @IsOptional()
  specifications?: Specifications;

  @ApiProperty()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsOptional()
  availability?: boolean;

  @ApiProperty()
  @IsOptional()
  rentalOptions?: RentalOptions[];

  @ApiProperty()
  @IsOptional()
  availableDays: {
    startDate?: Date;
    endDate?: Date;
  };
}

export class Specification {
  @ApiProperty()
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  processor?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  graphicCard?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  ramSize?: number;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  storageSize?: number;
}

export class RentalOptions {
  @ApiProperty()
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty()
  @IsOptional()
  priceRate?: number;

  @IsOptional()
  isSelected?: true;
}
