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
exports.PriceRulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const price_rule_entity_1 = require("./entities/price-rule.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
let PriceRulesService = class PriceRulesService {
    priceRulesRepository;
    customersRepository;
    productsRepository;
    constructor(priceRulesRepository, customersRepository, productsRepository) {
        this.priceRulesRepository = priceRulesRepository;
        this.customersRepository = customersRepository;
        this.productsRepository = productsRepository;
    }
    async create(createPriceRuleDto) {
        const customer = await this.customersRepository.findOne({
            where: { id: createPriceRuleDto.customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${createPriceRuleDto.customerId} not found`);
        }
        const product = await this.productsRepository.findOne({
            where: { id: createPriceRuleDto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${createPriceRuleDto.productId} not found`);
        }
        const existingRule = await this.priceRulesRepository.findOne({
            where: {
                customerId: createPriceRuleDto.customerId,
                productId: createPriceRuleDto.productId,
            },
        });
        if (existingRule) {
            throw new common_1.ConflictException('Price rule for this customer and product already exists');
        }
        const priceRule = this.priceRulesRepository.create(createPriceRuleDto);
        return this.priceRulesRepository.save(priceRule);
    }
    async findAll(customerId) {
        const query = this.priceRulesRepository
            .createQueryBuilder('priceRule')
            .leftJoinAndSelect('priceRule.customer', 'customer')
            .leftJoinAndSelect('priceRule.product', 'product');
        if (customerId) {
            query.where('priceRule.customerId = :customerId', { customerId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const priceRule = await this.priceRulesRepository.findOne({
            where: { id },
            relations: ['customer', 'product'],
        });
        if (!priceRule) {
            throw new common_1.NotFoundException(`Price rule with ID ${id} not found`);
        }
        return priceRule;
    }
    async update(id, updatePriceRuleDto) {
        const priceRule = await this.findOne(id);
        await this.priceRulesRepository.update(id, updatePriceRuleDto);
        return this.findOne(id);
    }
    async remove(id) {
        const priceRule = await this.findOne(id);
        await this.priceRulesRepository.remove(priceRule);
    }
};
exports.PriceRulesService = PriceRulesService;
exports.PriceRulesService = PriceRulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(price_rule_entity_1.PriceRule)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PriceRulesService);
//# sourceMappingURL=price-rules.service.js.map