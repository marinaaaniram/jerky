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
exports.DeliverySurveysController = void 0;
const common_1 = require("@nestjs/common");
const delivery_surveys_service_1 = require("./delivery-surveys.service");
const create_delivery_survey_dto_1 = require("./dto/create-delivery-survey.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let DeliverySurveysController = class DeliverySurveysController {
    deliverySurveysService;
    constructor(deliverySurveysService) {
        this.deliverySurveysService = deliverySurveysService;
    }
    async create(createDeliverySurveyDto) {
        return this.deliverySurveysService.create(createDeliverySurveyDto);
    }
    async findAll() {
        return this.deliverySurveysService.findAll();
    }
    async findOne(id) {
        return this.deliverySurveysService.findOne(id);
    }
    async findByOrder(orderId) {
        return this.deliverySurveysService.findByOrder(orderId);
    }
};
exports.DeliverySurveysController = DeliverySurveysController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('Руководитель', 'Курьер'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delivery_survey_dto_1.CreateDeliverySurveyDto]),
    __metadata("design:returntype", Promise)
], DeliverySurveysController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliverySurveysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DeliverySurveysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DeliverySurveysController.prototype, "findByOrder", null);
exports.DeliverySurveysController = DeliverySurveysController = __decorate([
    (0, common_1.Controller)('api/delivery-surveys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [delivery_surveys_service_1.DeliverySurveysService])
], DeliverySurveysController);
//# sourceMappingURL=delivery-surveys.controller.js.map