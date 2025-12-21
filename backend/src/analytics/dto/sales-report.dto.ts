export class SalesPeriodDto {
  period: string;
  revenue: number;
  orderCount: number;
  averageCheck: number;
  ordersDelivered: number;
}

export class SalesReportDto {
  data: SalesPeriodDto[];
  totalRevenue: number;
  totalOrders: number;
  totalAverageCheck: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
