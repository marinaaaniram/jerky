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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
let SearchService = class SearchService {
    ordersRepository;
    customersRepository;
    productsRepository;
    constructor(ordersRepository, customersRepository, productsRepository) {
        this.ordersRepository = ordersRepository;
        this.customersRepository = customersRepository;
        this.productsRepository = productsRepository;
    }
    async globalSearch(query, limit = 10) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const searchTerm = `%${query}%`;
        const results = [];
        try {
            const whereConditions = [];
            if (/^\d+$/.test(query)) {
                whereConditions.push({ id: parseInt(query, 10) });
            }
            whereConditions.push({ notes: (0, typeorm_2.ILike)(searchTerm) });
            const orders = await this.ordersRepository.find({
                where: whereConditions.length > 0 ? whereConditions : undefined,
                relations: ['customer'],
                take: 3,
            });
            orders.forEach((order) => {
                results.push({
                    type: 'order',
                    id: order.id,
                    title: `Заказ #${order.id}`,
                    description: '',
                    icon: '📦',
                    url: `/orders/${order.id}`,
                    status: order.status,
                    customer: order.customer?.name || 'Неизвестный',
                    notes: order.notes || undefined,
                });
            });
            const customers = await this.customersRepository.find({
                where: [
                    { name: (0, typeorm_2.ILike)(searchTerm) },
                    { phone: (0, typeorm_2.ILike)(searchTerm) },
                ],
                take: 3,
            });
            customers.forEach((customer) => {
                results.push({
                    type: 'customer',
                    id: customer.id,
                    title: customer.name,
                    description: `${customer.phone || 'Телефон не указан'} | ${customer.paymentType}`,
                    icon: '👤',
                    url: `/customers/${customer.id}`,
                });
            });
            const products = await this.productsRepository.find({
                where: { name: (0, typeorm_2.ILike)(searchTerm) },
                take: 3,
            });
            products.forEach((product) => {
                results.push({
                    type: 'product',
                    id: product.id,
                    title: product.name,
                    description: `Цена: ${product.price}₽ | Склад: ${product.stockQuantity} шт`,
                    icon: '📦',
                    url: `/products/${product.id}`,
                });
            });
        }
        catch (error) {
            console.error('Search error:', error);
            return [];
        }
        return results.slice(0, limit);
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map