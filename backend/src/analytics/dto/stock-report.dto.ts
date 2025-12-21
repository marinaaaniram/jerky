export class StockMovementReportDto {
  id: number;
  productId: number;
  productName: string;
  quantityChange: number;
  reason: string;
  reasonText?: string;
  movementDate: Date;
  userId: number;
  userName: string;
}

export class StockLevelDto {
  id: number;
  name: string;
  currentStock: number;
  price: number;
  status: 'zero' | 'low' | 'normal' | 'overstocked';
}

export class StockMovementsReportDto {
  data: StockMovementReportDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export class StockLevelsReportDto {
  data: StockLevelDto[];
  summary: {
    totalProducts: number;
    zeroStockCount: number;
    lowStockCount: number;
    normalStockCount: number;
    overstockedCount: number;
  };
}
