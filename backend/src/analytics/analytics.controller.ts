import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  DefaultValuePipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from './services/analytics.service';
import { TimeFilterDto } from './dto/time-filter.dto';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Руководитель', 'Менеджер по продажам')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async getSalesReport(@Query() timeFilter: TimeFilterDto) {
    const salesData = await this.analyticsService.getSalesData(timeFilter);

    return {
      data: [salesData],
      totalRevenue: salesData.revenue,
      totalOrders: salesData.orderCount,
      totalAverageCheck: salesData.averageCheck,
      pagination: {
        page: 0,
        limit: 50,
        total: 1,
      },
    };
  }

  @Get('customers/top')
  @HttpCode(HttpStatus.OK)
  async getTopCustomers(
    @Query() timeFilter: TimeFilterDto,
    @Query('limit', new DefaultValuePipe(50)) limit: number,
  ) {
    const customers = await this.analyticsService.getTopCustomers(timeFilter, limit);

    return {
      data: customers.map((c) => ({
        id: c.customerId,
        name: c.customerName,
        phone: c.customerPhone,
        totalOrders: parseInt(c.totalOrders),
        totalRevenue: parseFloat(c.revenue),
        averageOrderValue: parseInt(c.totalOrders) > 0 ? parseFloat(c.revenue) / parseInt(c.totalOrders) : 0,
        lastOrderDate: c.lastOrderDate,
        paymentType: c.paymentType,
      })),
      pagination: {
        page: timeFilter.page || 0,
        limit: timeFilter.limit || 50,
        total: customers.length,
      },
    };
  }

  @Get('customers/debtors')
  @HttpCode(HttpStatus.OK)
  async getDebtors(
    @Query('limit', new DefaultValuePipe(50)) limit: number,
  ) {
    const debtors = await this.analyticsService.getDebtors(limit);

    return {
      data: debtors.map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        currentDebt: d.debt,
        lastOrderDate: d.updatedAt,
      })),
      totalDebt: debtors.reduce((sum, d) => sum + d.debt, 0),
      pagination: {
        page: 0,
        limit,
        total: debtors.length,
      },
    };
  }

  @Get('products/top')
  @HttpCode(HttpStatus.OK)
  async getTopProducts(
    @Query() timeFilter: TimeFilterDto,
    @Query('sortBy', new DefaultValuePipe('quantity')) sortBy: 'quantity' | 'revenue',
    @Query('limit', new DefaultValuePipe(50)) limit: number,
  ) {
    const products = await this.analyticsService.getTopProducts(
      timeFilter,
      limit,
      sortBy,
    );

    return {
      data: products.map((p) => ({
        id: p.productId,
        name: p.productName,
        totalQuantity: parseInt(p.totalQuantity),
        totalRevenue: parseFloat(p.totalRevenue),
        averagePrice: parseFloat(p.currentPrice),
        currentStock: p.currentStock,
      })),
      pagination: {
        page: timeFilter.page || 0,
        limit: timeFilter.limit || 50,
        total: products.length,
      },
    };
  }

  @Get('stock/movements')
  @HttpCode(HttpStatus.OK)
  async getStockMovements(@Query() timeFilter: TimeFilterDto) {
    const movements = await this.analyticsService.getStockMovements(
      timeFilter,
      undefined,
      undefined,
      timeFilter.limit || 50,
    );

    return {
      data: movements.map((m) => ({
        id: m.id,
        productId: m.productId,
        productName: m.product?.name,
        quantityChange: m.quantityChange,
        reason: m.reason,
        reasonText: m.reasonText,
        movementDate: m.movementDate,
        userId: m.userId,
        userName: m.user?.firstName + ' ' + m.user?.lastName,
      })),
      pagination: {
        page: timeFilter.page || 0,
        limit: timeFilter.limit || 50,
        total: movements.length,
      },
    };
  }

  @Get('stock/levels')
  @HttpCode(HttpStatus.OK)
  async getStockLevels(
    @Query('status', new DefaultValuePipe('all')) status: 'low' | 'zero' | 'overstocked' | 'all',
  ) {
    const levels = await this.analyticsService.getStockLevels();

    const filtered =
      status === 'all' ? levels : levels.filter((l) => l.status === status);

    const summary = {
      totalProducts: levels.length,
      zeroStockCount: levels.filter((l) => l.status === 'zero').length,
      lowStockCount: levels.filter((l) => l.status === 'low').length,
      normalStockCount: levels.filter((l) => l.status === 'normal').length,
      overstockedCount: levels.filter((l) => l.status === 'overstocked').length,
    };

    return {
      data: filtered,
      summary,
    };
  }

  @Get('orders/status')
  @HttpCode(HttpStatus.OK)
  async getOrderStatus(@Query() timeFilter: TimeFilterDto) {
    return this.analyticsService.getOrderStatus(timeFilter);
  }
}
