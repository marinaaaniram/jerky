import { AnalyticsService } from './services/analytics.service';
import { TimeFilterDto } from './dto/time-filter.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getSalesReport(timeFilter: TimeFilterDto): Promise<{
        data: {
            orderCount: number;
            revenue: number;
            averageCheck: number;
        }[];
        totalRevenue: number;
        totalOrders: number;
        totalAverageCheck: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getTopCustomers(timeFilter: TimeFilterDto, limit: number): Promise<{
        data: {
            id: any;
            name: any;
            phone: any;
            totalOrders: number;
            totalRevenue: number;
            averageOrderValue: number;
            lastOrderDate: any;
            paymentType: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getDebtors(limit: number): Promise<{
        data: {
            id: number;
            name: string;
            phone: string;
            currentDebt: number;
            lastOrderDate: Date;
        }[];
        totalDebt: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getTopProducts(timeFilter: TimeFilterDto, sortBy: 'quantity' | 'revenue', limit: number): Promise<{
        data: {
            id: any;
            name: any;
            totalQuantity: number;
            totalRevenue: number;
            averagePrice: number;
            currentStock: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getStockMovements(timeFilter: TimeFilterDto): Promise<{
        data: {
            id: number;
            productId: number;
            productName: string;
            quantityChange: number;
            reason: import("../stock-movements/entities/stock-movement.entity").MovementReason;
            reasonText: string | undefined;
            movementDate: Date;
            userId: number | undefined;
            userName: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }>;
    getStockLevels(status: 'low' | 'zero' | 'overstocked' | 'all'): Promise<{
        data: {
            id: number;
            name: string;
            currentStock: number;
            price: number;
            status: "zero" | "low" | "normal" | "overstocked";
        }[];
        summary: {
            totalProducts: number;
            zeroStockCount: number;
            lowStockCount: number;
            normalStockCount: number;
            overstockedCount: number;
        };
    }>;
    getOrderStatus(timeFilter: TimeFilterDto): Promise<{
        distribution: {
            status: any;
            count: number;
            percentage: number;
        }[];
        totalOrders: number;
        totalDelivered: any;
        totalInProgress: number;
    }>;
}
