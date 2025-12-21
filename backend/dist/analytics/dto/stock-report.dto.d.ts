export declare class StockMovementReportDto {
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
export declare class StockLevelDto {
    id: number;
    name: string;
    currentStock: number;
    price: number;
    status: 'zero' | 'low' | 'normal' | 'overstocked';
}
export declare class StockMovementsReportDto {
    data: StockMovementReportDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class StockLevelsReportDto {
    data: StockLevelDto[];
    summary: {
        totalProducts: number;
        zeroStockCount: number;
        lowStockCount: number;
        normalStockCount: number;
        overstockedCount: number;
    };
}
