export class CreateProductDto {
  name: string;
  description: string;
  specifications: {
    brand: string;
    model: string;
    processor: string;
    graphicCard: string;
    ramSize: number;
    storageSize: number;
  };
  rentalOptions: RentalOption[];
  availableDays: {
    startDate: Date;
    endDate: Date;
  };
}

export class RentalOption {
  type: string;
  priceRate: number;
}
