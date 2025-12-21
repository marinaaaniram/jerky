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
exports.CustomerInteractionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_interaction_entity_1 = require("../entities/customer-interaction.entity");
const customer_interaction_response_dto_1 = require("../dto/customer-interaction-response.dto");
let CustomerInteractionService = class CustomerInteractionService {
    interactionRepository;
    constructor(interactionRepository) {
        this.interactionRepository = interactionRepository;
    }
    async logOrderCreated(customerId, orderId, userId) {
        const interaction = this.interactionRepository.create({
            customerId,
            userId,
            type: customer_interaction_entity_1.CustomerInteractionType.ORDER_CREATED,
            description: `Создан заказ #${orderId}`,
            metadata: { orderId },
        });
        await this.interactionRepository.save(interaction);
    }
    async logOrderDelivered(customerId, orderId, userId) {
        const interaction = this.interactionRepository.create({
            customerId,
            userId,
            type: customer_interaction_entity_1.CustomerInteractionType.ORDER_DELIVERED,
            description: `Заказ #${orderId} доставлен`,
            metadata: { orderId },
        });
        await this.interactionRepository.save(interaction);
    }
    async logPaymentReceived(customerId, amount, userId) {
        const interaction = this.interactionRepository.create({
            customerId,
            userId,
            type: customer_interaction_entity_1.CustomerInteractionType.PAYMENT_RECEIVED,
            description: `Получен платёж на сумму ${amount}`,
            metadata: { amount },
        });
        await this.interactionRepository.save(interaction);
    }
    async logCustomerDataUpdated(customerId, changes, userId) {
        const descriptions = [];
        for (const [field, change] of Object.entries(changes)) {
            descriptions.push(`${field}: "${change.old}" → "${change.new}"`);
        }
        const interaction = this.interactionRepository.create({
            customerId,
            userId,
            type: customer_interaction_entity_1.CustomerInteractionType.CUSTOMER_DATA_UPDATED,
            description: `Изменены данные клиента: ${descriptions.join(', ')}`,
            metadata: { changes },
        });
        await this.interactionRepository.save(interaction);
    }
    async logArchived(customerId, userId) {
        const interaction = this.interactionRepository.create({
            customerId,
            userId,
            type: customer_interaction_entity_1.CustomerInteractionType.ARCHIVED,
            description: 'Клиент архивирован',
            metadata: {},
        });
        await this.interactionRepository.save(interaction);
    }
    async logUnarchived(customerId, userId) {
        const interaction = this.interactionRepository.create({
            customerId,
            userId,
            type: customer_interaction_entity_1.CustomerInteractionType.UNARCHIVED,
            description: 'Клиент восстановлен из архива',
            metadata: {},
        });
        await this.interactionRepository.save(interaction);
    }
    async findByCustomerId(customerId, limit = 50, offset = 0) {
        const [interactions, total] = await this.interactionRepository.findAndCount({
            where: { customerId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit,
        });
        return {
            data: interactions.map(i => this.mapToResponseDto(i)),
            total,
        };
    }
    mapToResponseDto(interaction) {
        return new customer_interaction_response_dto_1.CustomerInteractionResponseDto({
            id: interaction.id,
            type: interaction.type,
            description: interaction.description,
            metadata: interaction.metadata,
            user: interaction.user
                ? {
                    id: interaction.user.id,
                    firstName: interaction.user.firstName,
                    lastName: interaction.user.lastName,
                }
                : null,
            createdAt: interaction.createdAt,
        });
    }
};
exports.CustomerInteractionService = CustomerInteractionService;
exports.CustomerInteractionService = CustomerInteractionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_interaction_entity_1.CustomerInteraction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerInteractionService);
//# sourceMappingURL=customer-interaction.service.js.map