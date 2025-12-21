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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const customer_comment_service_1 = require("./services/customer-comment.service");
const customer_interaction_service_1 = require("./services/customer-interaction.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const create_customer_comment_dto_1 = require("./dto/create-customer-comment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let CustomersController = class CustomersController {
    customersService;
    commentService;
    interactionService;
    constructor(customersService, commentService, interactionService) {
        this.customersService = customersService;
        this.commentService = commentService;
        this.interactionService = interactionService;
    }
    async create(createCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }
    async findAll(includeArchived) {
        return this.customersService.findAll(includeArchived);
    }
    async findOne(id) {
        return this.customersService.findOne(id);
    }
    async update(id, updateCustomerDto, user) {
        return this.customersService.update(id, updateCustomerDto, user.id);
    }
    async archive(id, user) {
        return this.customersService.archive(id, user.id);
    }
    async unarchive(id, user) {
        return this.customersService.unarchive(id, user.id);
    }
    async addComment(customerId, createCommentDto, user) {
        return this.commentService.create(customerId, user.id, createCommentDto);
    }
    async getComments(customerId, page = 1, limit = 20) {
        return this.commentService.findByCustomerId(customerId, page, limit);
    }
    async deleteComment(customerId, commentId, user) {
        await this.commentService.delete(commentId, user.id, user.role?.name);
        return { success: true };
    }
    async getInteractions(customerId, limit = 50, offset = 0) {
        return this.interactionService.findByCustomerId(customerId, limit, offset);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('includeArchived', new common_1.ParseBoolPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_customer_dto_1.UpdateCustomerDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "archive", null);
__decorate([
    (0, common_1.Patch)(':id/unarchive'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "unarchive", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_customer_comment_dto_1.CreateCustomerCommentDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getComments", null);
__decorate([
    (0, common_1.Delete)(':id/comments/:commentId'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('commentId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Get)(':id/interactions'),
    (0, roles_decorator_1.Roles)('Руководитель', 'Менеджер по продажам'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('offset', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getInteractions", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('api/customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [customers_service_1.CustomersService,
        customer_comment_service_1.CustomerCommentService,
        customer_interaction_service_1.CustomerInteractionService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map