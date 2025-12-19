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
exports.StockMovementsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_movement_entity_1 = require("./entities/stock-movement.entity");
const product_entity_1 = require("../products/entities/product.entity");
let StockMovementsService = class StockMovementsService {
    stockMovementsRepository;
    productsRepository;
    dataSource;
    constructor(stockMovementsRepository, productsRepository, dataSource) {
        this.stockMovementsRepository = stockMovementsRepository;
        this.productsRepository = productsRepository;
        this.dataSource = dataSource;
    }
    async create(createStockMovementDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                where: { id: createStockMovementDto.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${createStockMovementDto.productId} not found`);
            }
            const newQuantity = product.stockQuantity + createStockMovementDto.quantity;
            if (newQuantity < 0) {
                throw new common_1.BadRequestException(`Insufficient stock. Available: ${product.stockQuantity}, Requested: ${Math.abs(createStockMovementDto.quantity)}`);
            }
            const stockMovement = queryRunner.manager.create(stock_movement_entity_1.StockMovement, createStockMovementDto);
            await queryRunner.manager.save(stockMovement);
            product.stockQuantity = newQuantity;
            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();
            return stockMovement;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(productId) {
        const query = this.stockMovementsRepository
            .createQueryBuilder('movement')
            .leftJoinAndSelect('movement.product', 'product')
            .orderBy('movement.createdAt', 'DESC');
        if (productId) {
            query.where('movement.productId = :productId', { productId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const movement = await this.stockMovementsRepository.findOne({
            where: { id },
            relations: ['product'],
        });
        if (!movement) {
            throw new common_1.NotFoundException(`Stock movement with ID ${id} not found`);
        }
        return movement;
    }
};
exports.StockMovementsService = StockMovementsService;
exports.StockMovementsService = StockMovementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], StockMovementsService);
//# sourceMappingURL=stock-movements.service.js.map