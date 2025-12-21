import { Repository } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';
import { StockMovement, MovementReason } from '../../stock-movements/entities/stock-movement.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { TimeFilterDto } from '../dto/time-filter.dto';
export declare class AnalyticsService {
    private ordersRepository;
    private orderItemsRepository;
    private customersRepository;
    private productsRepository;
    private stockMovementsRepository;
    private paymentsRepository;
    constructor(ordersRepository: Repository<Order>, orderItemsRepository: Repository<OrderItem>, customersRepository: Repository<Customer>, productsRepository: Repository<Product>, stockMovementsRepository: Repository<StockMovement>, paymentsRepository: Repository<Payment>);
    getSalesData(timeFilter: TimeFilterDto): Promise<{
        orderCount: number;
        revenue: number;
        averageCheck: number;
    }>;
    getTopCustomers(timeFilter: TimeFilterDto, limit?: number): Promise<any[]>;
    getDebtors(limit?: number): Promise<Customer[]>;
    getTopProducts(timeFilter: TimeFilterDto, limit?: number, sortBy?: 'quantity' | 'revenue'): Promise<any[]>;
    getStockMovements(timeFilter: TimeFilterDto, reason?: MovementReason, productId?: number, limit?: number): Promise<StockMovement[]>;
    getStockLevels(): Promise<{
        id: number;
        name: string;
        currentStock: number;
        price: number;
        status: "zero" | "low" | "normal" | "overstocked";
    }[]>;
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
