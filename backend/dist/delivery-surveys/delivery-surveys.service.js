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
exports.DeliverySurveysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const delivery_survey_entity_1 = require("./entities/delivery-survey.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let DeliverySurveysService = class DeliverySurveysService {
    deliverySurveysRepository;
    ordersRepository;
    constructor(deliverySurveysRepository, ordersRepository) {
        this.deliverySurveysRepository = deliverySurveysRepository;
        this.ordersRepository = ordersRepository;
    }
    async create(createDeliverySurveyDto) {
        const order = await this.ordersRepository.findOne({
            where: { id: createDeliverySurveyDto.orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${createDeliverySurveyDto.orderId} not found`);
        }
        const existingSurvey = await this.deliverySurveysRepository.findOne({
            where: { orderId: createDeliverySurveyDto.orderId },
        });
        if (existingSurvey) {
            throw new common_1.ConflictException('Delivery survey for this order already exists');
        }
        const survey = this.deliverySurveysRepository.create(createDeliverySurveyDto);
        return this.deliverySurveysRepository.save(survey);
    }
    async findAll() {
        return this.deliverySurveysRepository.find({
            relations: ['order', 'order.customer'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id) {
        const survey = await this.deliverySurveysRepository.findOne({
            where: { id },
            relations: ['order', 'order.customer'],
        });
        if (!survey) {
            throw new common_1.NotFoundException(`Delivery survey with ID ${id} not found`);
        }
        return survey;
    }
    async findByOrder(orderId) {
        return this.deliverySurveysRepository.findOne({
            where: { orderId },
            relations: ['order'],
        });
    }
};
exports.DeliverySurveysService = DeliverySurveysService;
exports.DeliverySurveysService = DeliverySurveysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(delivery_survey_entity_1.DeliverySurvey)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DeliverySurveysService);
//# sourceMappingURL=delivery-surveys.service.js.map