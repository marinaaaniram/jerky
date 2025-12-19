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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
let PaymentsService = class PaymentsService {
    paymentsRepository;
    customersRepository;
    dataSource;
    constructor(paymentsRepository, customersRepository, dataSource) {
        this.paymentsRepository = paymentsRepository;
        this.customersRepository = customersRepository;
        this.dataSource = dataSource;
    }
    async create(createPaymentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const customer = await queryRunner.manager.findOne(customer_entity_1.Customer, {
                where: { id: createPaymentDto.customerId },
            });
            if (!customer) {
                throw new common_1.NotFoundException(`Customer with ID ${createPaymentDto.customerId} not found`);
            }
            const payment = queryRunner.manager.create(payment_entity_1.Payment, {
                customerId: createPaymentDto.customerId,
                amount: createPaymentDto.amount,
                notes: createPaymentDto.notes,
            });
            await queryRunner.manager.save(payment);
            customer.debt -= createPaymentDto.amount;
            await queryRunner.manager.save(customer);
            await queryRunner.commitTransaction();
            return payment;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(customerId) {
        const query = this.paymentsRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.customer', 'customer')
            .orderBy('payment.createdAt', 'DESC');
        if (customerId) {
            query.where('payment.customerId = :customerId', { customerId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const payment = await this.paymentsRepository.findOne({
            where: { id },
            relations: ['customer'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map