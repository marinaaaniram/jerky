export declare class OrderStatusDistributionDto {
    status: string;
    count: number;
    percentage: number;
    color?: string;
}
export declare class OrderStatusReportDto {
    distribution: OrderStatusDistributionDto[];
    totalOrders: number;
    totalDelivered: number;
    totalInProgress: number;
    averageDeliveryTime?: number;
}
