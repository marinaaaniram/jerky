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
exports.PriceRulesController = void 0;
const common_1 = require("@nestjs/common");
const price_rules_service_1 = require("./price-rules.service");
const create_price_rule_dto_1 = require("./dto/create-price-rule.dto");
const update_price_rule_dto_1 = require("./dto/update-price-rule.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let PriceRulesController = class PriceRulesController {
    priceRulesService;
    constructor(priceRulesService) {
        this.priceRulesService = priceRulesService;
    }
    async create(createPriceRuleDto) {
        return this.priceRulesService.create(createPriceRuleDto);
    }
    async findAll(customerId) {
        return this.priceRulesService.findAll(customerId);
    }
    async findOne(id) {
        return this.priceRulesService.findOne(id);
    }
    async update(id, updatePriceRuleDto) {
        return this.priceRulesService.update(id, updatePriceRuleDto);
    }
    async remove(id) {
        return this.priceRulesService.remove(id);
    }
};
exports.PriceRulesController = PriceRulesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_price_rule_dto_1.CreatePriceRuleDto]),
    __metadata("design:returntype", Promise)
], PriceRulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('customerId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriceRulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriceRulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_price_rule_dto_1.UpdatePriceRuleDto]),
    __metadata("design:returntype", Promise)
], PriceRulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PriceRulesController.prototype, "remove", null);
exports.PriceRulesController = PriceRulesController = __decorate([
    (0, common_1.Controller)('api/price-rules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [price_rules_service_1.PriceRulesService])
], PriceRulesController);
//# sourceMappingURL=price-rules.controller.js.map