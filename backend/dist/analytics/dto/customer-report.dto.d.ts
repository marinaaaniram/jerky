export declare class TopCustomerDto {
    id: number;
    name: string;
    phone?: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    lastOrderDate: Date;
    paymentType: 'прямые' | 'реализация';
}
export declare class DebtorDto {
    id: number;
    name: string;
    phone?: string;
    currentDebt: number;
    lastPaymentDate?: Date;
    lastOrderDate: Date;
}
export declare class TopCustomersReportDto {
    data: TopCustomerDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class DebtorsReportDto {
    data: DebtorDto[];
    totalDebt: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
