"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
const order_item_entity_1 = require("../../orders/entities/order-item.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const stock_movement_entity_1 = require("../../stock-movements/entities/stock-movement.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const date_range_helper_1 = require("../utils/date-range.helper");
let AnalyticsService = class AnalyticsService {
    ordersRepository;
    orderItemsRepository;
    customersRepository;
    productsRepository;
    stockMovementsRepository;
    paymentsRepository;
    constructor(ordersRepository, orderItemsRepository, customersRepository, productsRepository, stockMovementsRepository, paymentsRepository) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.customersRepository = customersRepository;
        this.productsRepository = productsRepository;
        this.stockMovementsRepository = stockMovementsRepository;
        this.paymentsRepository = paymentsRepository;
    }
    async getSalesData(timeFilter) {
        const dateRange = date_range_helper_1.DateRangeHelper.getDateRange(timeFilter.period, timeFilter.startDate, timeFilter.endDate);
        const query = this.ordersRepository
            .createQueryBuilder('order')
            .select('COUNT(DISTINCT order.id)', 'orderCount')
            .addSelect('COALESCE(SUM(item.price * item.quantity), 0)', 'revenue')
            .leftJoin('order.orderItems', 'item')
            .where('order.status = :status', { status: order_entity_1.OrderStatus.DELIVERED })
            .andWhere('order.orderDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate });
        const result = await query.getRawOne();
        return {
            orderCount: parseInt(result?.orderCount || 0),
            revenue: parseFloat(result?.revenue || 0),
            averageCheck: parseInt(result?.orderCount || 0) > 0
                ? parseFloat(result?.revenue || 0) / parseInt(result?.orderCount || 0)
                : 0,
        };
    }
    async getTopCustomers(timeFilter, limit = 50) {
        const dateRange = date_range_helper_1.DateRangeHelper.getDateRange(timeFilter.period, timeFilter.startDate, timeFilter.endDate);
        const query = this.ordersRepository
            .createQueryBuilder('order')
            .select('customer.id', 'customerId')
            .addSelect('customer.name', 'customerName')
            .addSelect('customer.phone', 'customerPhone')
            .addSelect('customer.paymentType', 'paymentType')
            .addSelect('COUNT(DISTINCT order.id)', 'totalOrders')
            .addSelect('COALESCE(SUM(item.price * item.quantity), 0)', 'revenue')
            .addSelect('MAX(order.orderDate)', 'lastOrderDate')
            .leftJoin('order.customer', 'customer')
            .leftJoin('order.orderItems', 'item')
            .where('order.status = :status', { status: order_entity_1.OrderStatus.DELIVERED })
            .andWhere('order.orderDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate })
            .groupBy('customer.id, customer.name, customer.phone, customer.paymentType')
            .orderBy('revenue', 'DESC')
            .limit(limit);
        return query.getRawMany();
    }
    async getDebtors(limit = 50) {
        return this.customersRepository
            .createQueryBuilder('customer')
            .where('customer.paymentType = :type', { type: customer_entity_1.PaymentType.CONSIGNMENT })
            .andWhere('customer.debt > 0')
            .orderBy('customer.debt', 'DESC')
            .limit(limit)
            .getMany();
    }
    async getTopProducts(timeFilter, limit = 50, sortBy = 'quantity') {
        const dateRange = date_range_helper_1.DateRangeHelper.getDateRange(timeFilter.period, timeFilter.startDate, timeFilter.endDate);
        const query = this.orderItemsRepository
            .createQueryBuilder('item')
            .select('product.id', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('SUM(item.quantity)', 'totalQuantity')
            .addSelect('COALESCE(SUM(item.price * item.quantity), 0)', 'totalRevenue')
            .addSelect('product.price', 'currentPrice')
            .addSelect('product.stockQuantity', 'currentStock')
            .leftJoin('item.product', 'product')
            .leftJoin('item.order', 'order')
            .where('order.status = :status', { status: order_entity_1.OrderStatus.DELIVERED })
            .andWhere('order.orderDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate })
            .groupBy('product.id, product.name, product.price, product.stockQuantity')
            .orderBy(sortBy === 'quantity' ? 'totalQuantity' : 'totalRevenue', 'DESC')
            .limit(limit);
        return query.getRawMany();
    }
    async getStockMovements(timeFilter, reason, productId, limit = 50) {
        let query = this.stockMovementsRepository
            .createQueryBuilder('movement')
            .leftJoinAndSelect('movement.product', 'product')
            .leftJoinAndSelect('movement.user', 'user')
            .where('movement.isActive = :isActive', { isActive: true });
        const dateRange = date_range_helper_1.DateRangeHelper.getDateRange(timeFilter.period, timeFilter.startDate, timeFilter.endDate);
        query = query
            .andWhere('movement.movementDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('movement.movementDate <= :endDate', { endDate: dateRange.endDate });
        if (reason) {
            query = query.andWhere('movement.reason = :reason', { reason });
        }
        if (productId) {
            query = query.andWhere('movement.productId = :productId', { productId });
        }
        return query
            .orderBy('movement.movementDate', 'DESC')
            .limit(limit)
            .getMany();
    }
    async getStockLevels() {
        const products = await this.productsRepository.find();
        return products.map((product) => {
            let status = 'normal';
            if (product.stockQuantity === 0) {
                status = 'zero';
            }
            else if (product.stockQuantity < 10) {
                status = 'low';
            }
            else if (product.stockQuantity > 500) {
                status = 'overstocked';
            }
            return {
                id: product.id,
                name: product.name,
                currentStock: product.stockQuantity,
                price: product.price,
                status,
            };
        });
    }
    async getOrderStatus(timeFilter) {
        const dateRange = date_range_helper_1.DateRangeHelper.getDateRange(timeFilter.period, timeFilter.startDate, timeFilter.endDate);
        const allOrdersQuery = this.ordersRepository
            .createQueryBuilder('order')
            .where('order.orderDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate });
        const distribution = await this.ordersRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('order.orderDate >= :startDate', { startDate: dateRange.startDate })
            .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate })
            .groupBy('order.status')
            .getRawMany();
        const totalOrders = await allOrdersQuery.getCount();
        return {
            distribution: distribution.map((d) => ({
                status: d.status,
                count: parseInt(d.count),
                percentage: totalOrders > 0 ? (parseInt(d.count) / totalOrders) * 100 : 0,
            })),
            totalOrders,
            totalDelivered: distribution.find((d) => d.status === order_entity_1.OrderStatus.DELIVERED)?.count || 0,
            totalInProgress: totalOrders - (distribution.find((d) => d.status === order_entity_1.OrderStatus.DELIVERED)?.count || 0),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(4, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __param(5, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map