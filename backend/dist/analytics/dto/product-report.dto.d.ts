export declare class TopProductDto {
    id: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    averagePrice: number;
    currentStock: number;
}
export declare class TopProductsReportDto {
    data: TopProductDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
