import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Customer, PaymentType } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';
import { StockMovement, MovementReason } from '../../stock-movements/entities/stock-movement.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { TimeFilterDto, PeriodType } from '../dto/time-filter.dto';
import { DateRangeHelper } from '../utils/date-range.helper';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private stockMovementsRepository: Repository<StockMovement>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  async getSalesData(timeFilter: TimeFilterDto) {
    const dateRange = DateRangeHelper.getDateRange(
      timeFilter.period as PeriodType,
      timeFilter.startDate,
      timeFilter.endDate,
    );

    const query = this.ordersRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.id)', 'orderCount')
      .addSelect('COALESCE(SUM(item.price * item.quantity), 0)', 'revenue')
      .leftJoin('order.orderItems', 'item')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
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

  async getTopCustomers(timeFilter: TimeFilterDto, limit: number = 50) {
    const dateRange = DateRangeHelper.getDateRange(
      timeFilter.period as PeriodType,
      timeFilter.startDate,
      timeFilter.endDate,
    );

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
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.orderDate >= :startDate', { startDate: dateRange.startDate })
      .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate })
      .groupBy('customer.id, customer.name, customer.phone, customer.paymentType')
      .orderBy('revenue', 'DESC')
      .limit(limit);

    return query.getRawMany();
  }

  async getDebtors(limit: number = 50) {
    return this.customersRepository
      .createQueryBuilder('customer')
      .where('customer.paymentType = :type', { type: PaymentType.CONSIGNMENT })
      .andWhere('customer.debt > 0')
      .orderBy('customer.debt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getTopProducts(timeFilter: TimeFilterDto, limit: number = 50, sortBy: 'quantity' | 'revenue' = 'quantity') {
    const dateRange = DateRangeHelper.getDateRange(
      timeFilter.period as PeriodType,
      timeFilter.startDate,
      timeFilter.endDate,
    );

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
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.orderDate >= :startDate', { startDate: dateRange.startDate })
      .andWhere('order.orderDate <= :endDate', { endDate: dateRange.endDate })
      .groupBy('product.id, product.name, product.price, product.stockQuantity')
      .orderBy(sortBy === 'quantity' ? 'totalQuantity' : 'totalRevenue', 'DESC')
      .limit(limit);

    return query.getRawMany();
  }

  async getStockMovements(
    timeFilter: TimeFilterDto,
    reason?: MovementReason,
    productId?: number,
    limit: number = 50,
  ) {
    let query = this.stockMovementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.user', 'user')
      .where('movement.isActive = :isActive', { isActive: true });

    const dateRange = DateRangeHelper.getDateRange(
      timeFilter.period as PeriodType,
      timeFilter.startDate,
      timeFilter.endDate,
    );

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
      let status: 'zero' | 'low' | 'normal' | 'overstocked' = 'normal';
      if (product.stockQuantity === 0) {
        status = 'zero';
      } else if (product.stockQuantity < 10) {
        status = 'low';
      } else if (product.stockQuantity > 500) {
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

  async getOrderStatus(timeFilter: TimeFilterDto) {
    const dateRange = DateRangeHelper.getDateRange(
      timeFilter.period as PeriodType,
      timeFilter.startDate,
      timeFilter.endDate,
    );

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
      totalDelivered: distribution.find((d) => d.status === OrderStatus.DELIVERED)?.count || 0,
      totalInProgress: totalOrders - (distribution.find((d) => d.status === OrderStatus.DELIVERED)?.count || 0),
    };
  }
}
