export declare class SalesPeriodDto {
    period: string;
    revenue: number;
    orderCount: number;
    averageCheck: number;
    ordersDelivered: number;
}
export declare class SalesReportDto {
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
