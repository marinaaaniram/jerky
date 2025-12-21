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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const analytics_service_1 = require("./services/analytics.service");
const time_filter_dto_1 = require("./dto/time-filter.dto");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getSalesReport(timeFilter) {
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
    async getTopCustomers(timeFilter, limit) {
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
    async getDebtors(limit) {
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
    async getTopProducts(timeFilter, sortBy, limit) {
        const products = await this.analyticsService.getTopProducts(timeFilter, limit, sortBy);
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
    async getStockMovements(timeFilter) {
        const movements = await this.analyticsService.getStockMovements(timeFilter, undefined, undefined, timeFilter.limit || 50);
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
    async getStockLevels(status) {
        const levels = await this.analyticsService.getStockLevels();
        const filtered = status === 'all' ? levels : levels.filter((l) => l.status === status);
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
    async getOrderStatus(timeFilter) {
        return this.analyticsService.getOrderStatus(timeFilter);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('sales'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_filter_dto_1.TimeFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('customers/top'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_filter_dto_1.TimeFilterDto, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('customers/debtors'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDebtors", null);
__decorate([
    (0, common_1.Get)('products/top'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('sortBy', new common_1.DefaultValuePipe('quantity'))),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_filter_dto_1.TimeFilterDto, String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('stock/movements'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_filter_dto_1.TimeFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStockMovements", null);
__decorate([
    (0, common_1.Get)('stock/levels'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('status', new common_1.DefaultValuePipe('all'))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStockLevels", null);
__decorate([
    (0, common_1.Get)('orders/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [time_filter_dto_1.TimeFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getOrderStatus", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('api/analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map