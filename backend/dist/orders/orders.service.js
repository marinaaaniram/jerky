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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const price_rule_entity_1 = require("../price-rules/entities/price-rule.entity");
const stock_movement_entity_1 = require("../stock-movements/entities/stock-movement.entity");
const delivery_survey_entity_1 = require("../delivery-surveys/entities/delivery-survey.entity");
let OrdersService = class OrdersService {
    ordersRepository;
    orderItemsRepository;
    customersRepository;
    productsRepository;
    priceRulesRepository;
    stockMovementsRepository;
    deliverySurveysRepository;
    dataSource;
    constructor(ordersRepository, orderItemsRepository, customersRepository, productsRepository, priceRulesRepository, stockMovementsRepository, deliverySurveysRepository, dataSource) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.customersRepository = customersRepository;
        this.productsRepository = productsRepository;
        this.priceRulesRepository = priceRulesRepository;
        this.stockMovementsRepository = stockMovementsRepository;
        this.deliverySurveysRepository = deliverySurveysRepository;
        this.dataSource = dataSource;
    }
    async create(createOrderDto) {
        const customer = await this.customersRepository.findOne({
            where: { id: createOrderDto.customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${createOrderDto.customerId} not found`);
        }
        const order = this.ordersRepository.create({
            customerId: createOrderDto.customerId,
            status: order_entity_1.OrderStatus.NEW,
            notes: createOrderDto.notes,
        });
        return this.ordersRepository.save(order);
    }
    async findAll() {
        return this.ordersRepository.find({
            relations: ['customer', 'orderItems', 'orderItems.product'],
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['customer', 'orderItems', 'orderItems.product', 'deliverySurvey'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async addItem(orderId, addItemDto) {
        const order = await this.findOne(orderId);
        if (order.status === order_entity_1.OrderStatus.DELIVERED) {
            throw new common_1.ForbiddenException('Cannot modify delivered orders');
        }
        const product = await this.productsRepository.findOne({
            where: { id: addItemDto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${addItemDto.productId} not found`);
        }
        const priceRule = await this.priceRulesRepository.findOne({
            where: {
                customerId: order.customerId,
                productId: addItemDto.productId,
            },
        });
        const price = priceRule ? priceRule.specialPrice : product.price;
        const existingItem = await this.orderItemsRepository.findOne({
            where: {
                orderId: orderId,
                productId: addItemDto.productId,
            },
        });
        if (existingItem) {
            existingItem.quantity += addItemDto.quantity;
            return this.orderItemsRepository.save(existingItem);
        }
        const orderItem = this.orderItemsRepository.create({
            orderId: orderId,
            productId: addItemDto.productId,
            quantity: addItemDto.quantity,
            price: price,
        });
        return this.orderItemsRepository.save(orderItem);
    }
    async updateStatus(orderId, updateStatusDto) {
        const order = await this.findOne(orderId);
        if (order.status === order_entity_1.OrderStatus.DELIVERED) {
            throw new common_1.ForbiddenException('Cannot modify delivered orders');
        }
        if (updateStatusDto.status === order_entity_1.OrderStatus.DELIVERED) {
            return this.deliverOrder(orderId);
        }
        order.status = updateStatusDto.status;
        return this.ordersRepository.save(order);
    }
    async deliverOrder(orderId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, {
                where: { id: orderId },
                relations: ['customer', 'orderItems', 'orderItems.product'],
            });
            if (!order) {
                throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
            }
            const deliverySurvey = await queryRunner.manager.findOne(delivery_survey_entity_1.DeliverySurvey, {
                where: { orderId: orderId },
            });
            if (!deliverySurvey) {
                throw new common_1.BadRequestException('Delivery survey is required before marking order as delivered');
            }
            order.status = order_entity_1.OrderStatus.DELIVERED;
            await queryRunner.manager.save(order);
            const orderTotal = order.orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
            if (order.customer.paymentType === customer_entity_1.PaymentType.CONSIGNMENT) {
                order.customer.debt += orderTotal;
                await queryRunner.manager.save(order.customer);
            }
            for (const item of order.orderItems) {
                const product = item.product;
                if (product.stockQuantity < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Required: ${item.quantity}`);
                }
                product.stockQuantity -= item.quantity;
                await queryRunner.manager.save(product);
                const stockMovement = queryRunner.manager.create(stock_movement_entity_1.StockMovement, {
                    productId: product.id,
                    quantity: -item.quantity,
                    reason: stock_movement_entity_1.MovementReason.SALE,
                    notes: `Заказ #${order.id} доставлен`,
                });
                await queryRunner.manager.save(stockMovement);
            }
            await queryRunner.commitTransaction();
            return this.findOne(orderId);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTotal(orderId) {
        const order = await this.findOne(orderId);
        return order.orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }
    async remove(id) {
        const order = await this.findOne(id);
        if (order.status === order_entity_1.OrderStatus.DELIVERED) {
            throw new common_1.ForbiddenException('Cannot delete delivered orders');
        }
        await this.ordersRepository.remove(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(4, (0, typeorm_1.InjectRepository)(price_rule_entity_1.PriceRule)),
    __param(5, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __param(6, (0, typeorm_1.InjectRepository)(delivery_survey_entity_1.DeliverySurvey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map