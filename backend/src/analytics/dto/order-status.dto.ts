export class OrderStatusDistributionDto {
  status: string;
  count: number;
  percentage: number;
  color?: string;
}

export class OrderStatusReportDto {
  distribution: OrderStatusDistributionDto[];
  totalOrders: number;
  totalDelivered: number;
  totalInProgress: number;
  averageDeliveryTime?: number; // in days
}
