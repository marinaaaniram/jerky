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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const customer_interaction_service_1 = require("./services/customer-interaction.service");
let CustomersService = class CustomersService {
    customersRepository;
    interactionService;
    constructor(customersRepository, interactionService) {
        this.customersRepository = customersRepository;
        this.interactionService = interactionService;
    }
    async create(createCustomerDto) {
        const customer = this.customersRepository.create({
            ...createCustomerDto,
            debt: 0,
            isArchived: false,
        });
        return this.customersRepository.save(customer);
    }
    async findAll(includeArchived = false) {
        const query = this.customersRepository.createQueryBuilder('customer');
        if (!includeArchived) {
            query.where('customer.isArchived = :isArchived', { isArchived: false });
        }
        return query.orderBy('customer.name', 'ASC').getMany();
    }
    async findOne(id) {
        const customer = await this.customersRepository.findOne({
            where: { id },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(id, updateCustomerDto, userId) {
        const oldCustomer = await this.findOne(id);
        const changes = {};
        for (const [key, newValue] of Object.entries(updateCustomerDto)) {
            if (oldCustomer[key] !== newValue && newValue !== undefined) {
                changes[key] = {
                    old: oldCustomer[key],
                    new: newValue,
                };
            }
        }
        await this.customersRepository.update(id, updateCustomerDto);
        const updatedCustomer = await this.findOne(id);
        if (Object.keys(changes).length > 0) {
            await this.interactionService.logCustomerDataUpdated(id, changes, userId);
        }
        return updatedCustomer;
    }
    async archive(id, userId) {
        const customer = await this.findOne(id);
        customer.isArchived = true;
        const archived = await this.customersRepository.save(customer);
        await this.interactionService.logArchived(id, userId);
        return archived;
    }
    async unarchive(id, userId) {
        const customer = await this.findOne(id);
        customer.isArchived = false;
        const unarchived = await this.customersRepository.save(customer);
        await this.interactionService.logUnarchived(id, userId);
        return unarchived;
    }
    async updateDebt(id, amount) {
        const customer = await this.findOne(id);
        customer.debt += amount;
        await this.customersRepository.save(customer);
        return customer;
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        customer_interaction_service_1.CustomerInteractionService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map