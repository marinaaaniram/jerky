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
exports.StockMovementsController = void 0;
const common_1 = require("@nestjs/common");
const stock_movements_service_1 = require("./stock-movements.service");
const create_stock_movement_dto_1 = require("./dto/create-stock-movement.dto");
const adjust_stock_dto_1 = require("./dto/adjust-stock.dto");
const cancel_movement_dto_1 = require("./dto/cancel-movement.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let StockMovementsController = class StockMovementsController {
    stockMovementsService;
    constructor(stockMovementsService) {
        this.stockMovementsService = stockMovementsService;
    }
    async create(createStockMovementDto) {
        return this.stockMovementsService.create(createStockMovementDto);
    }
    async findAll(productId) {
        return this.stockMovementsService.findAll(productId);
    }
    async findOne(id) {
        return this.stockMovementsService.findOne(id);
    }
    async adjustStock(productId, adjustStockDto, currentUser) {
        return this.stockMovementsService.adjustStock(productId, adjustStockDto, currentUser);
    }
    async cancelMovement(id, cancelMovementDto, currentUser) {
        return this.stockMovementsService.cancelMovement(id, cancelMovementDto, currentUser);
    }
    async getProductHistory(productId) {
        return this.stockMovementsService.getProductHistory(productId);
    }
};
exports.StockMovementsController = StockMovementsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Руководитель', 'Кладовщик'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_movement_dto_1.CreateStockMovementDto]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('adjust-stock/:productId'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Кладовщик'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, adjust_stock_dto_1.AdjustStockDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Кладовщик'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cancel_movement_dto_1.CancelMovementDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "cancelMovement", null);
__decorate([
    (0, common_1.Get)('product/:productId/history'),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StockMovementsController.prototype, "getProductHistory", null);
exports.StockMovementsController = StockMovementsController = __decorate([
    (0, common_1.Controller)('api/stock-movements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [stock_movements_service_1.StockMovementsService])
], StockMovementsController);
//# sourceMappingURL=stock-movements.controller.js.map