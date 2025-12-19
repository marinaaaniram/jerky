"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInitService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const role_entity_1 = require("../roles/entities/role.entity");
const user_entity_1 = require("../users/entities/user.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const price_rule_entity_1 = require("../price-rules/entities/price-rule.entity");
let DatabaseInitService = class DatabaseInitService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        if (process.env.NODE_ENV === 'development') {
            await this.seedDatabase();
        }
    }
    async seedDatabase() {
        try {
            await this.seedRoles();
            await this.seedUsers();
            await this.seedCustomers();
            await this.seedProducts();
            await this.seedPriceRules();
            console.log('✅ Database seeded successfully');
        }
        catch (error) {
            console.error('❌ Error seeding database:', error);
        }
    }
    async seedRoles() {
        const rolesRepository = this.dataSource.getRepository(role_entity_1.Role);
        const roles = [
            { name: 'Руководитель' },
            { name: 'Менеджер по продажам' },
            { name: 'Кладовщик' },
            { name: 'Курьер' },
            { name: 'Наблюдатель' },
        ];
        for (const role of roles) {
            const exists = await rolesRepository.findOne({ where: { name: role.name } });
            if (!exists) {
                await rolesRepository.save(role);
            }
        }
    }
    async seedUsers() {
        const usersRepository = this.dataSource.getRepository(user_entity_1.User);
        const rolesRepository = this.dataSource.getRepository(role_entity_1.Role);
        const roles = await rolesRepository.find();
        const roleMap = roles.reduce((acc, role) => {
            acc[role.name] = role.id;
            return acc;
        }, {});
        const users = [
            {
                firstName: 'Иван',
                lastName: 'Руководитель',
                email: 'ivan@jerky.com',
                password: 'password123',
                roleId: roleMap['Руководитель'],
            },
            {
                firstName: 'Петр',
                lastName: 'Менеджер',
                email: 'petr@jerky.com',
                password: 'password123',
                roleId: roleMap['Менеджер по продажам'],
            },
            {
                firstName: 'Сергей',
                lastName: 'Кладовщик',
                email: 'sergey@jerky.com',
                password: 'password123',
                roleId: roleMap['Кладовщик'],
            },
            {
                firstName: 'Алексей',
                lastName: 'Курьер',
                email: 'alexey@jerky.com',
                password: 'password123',
                roleId: roleMap['Курьер'],
            },
            {
                firstName: 'Мария',
                lastName: 'Наблюдатель',
                email: 'maria@jerky.com',
                password: 'password123',
                roleId: roleMap['Наблюдатель'],
            },
        ];
        for (const user of users) {
            const exists = await usersRepository.findOne({ where: { email: user.email } });
            if (!exists) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await usersRepository.save({
                    ...user,
                    password: hashedPassword,
                });
            }
        }
        console.log('   Default password for all users: password123');
    }
    async seedCustomers() {
        const customersRepository = this.dataSource.getRepository(customer_entity_1.Customer);
        const customers = [
            {
                name: 'Анна Петрова',
                phone: '+79161234567',
                address: 'г. Москва, ул. Ленина, д. 1',
            },
            {
                name: 'Дмитрий Сидоров',
                phone: '+79162345678',
                address: 'г. Москва, ул. Пушкина, д. 2',
            },
        ];
        for (const customer of customers) {
            const exists = await customersRepository.findOne({ where: { phone: customer.phone } });
            if (!exists) {
                await customersRepository.save(customer);
            }
        }
    }
    async seedProducts() {
        const productsRepository = this.dataSource.getRepository(product_entity_1.Product);
        const products = [
            {
                name: 'Джерки говяжий классический',
                price: 500,
                stockQuantity: 100,
            },
            {
                name: 'Джерки говяжий острый',
                price: 550,
                stockQuantity: 80,
            },
            {
                name: 'Джерки свиной с перцем',
                price: 450,
                stockQuantity: 120,
            },
        ];
        for (const product of products) {
            const exists = await productsRepository.findOne({ where: { name: product.name } });
            if (!exists) {
                await productsRepository.save(product);
            }
        }
    }
    async seedPriceRules() {
        const priceRulesRepository = this.dataSource.getRepository(price_rule_entity_1.PriceRule);
        const productsRepository = this.dataSource.getRepository(product_entity_1.Product);
        const customersRepository = this.dataSource.getRepository(customer_entity_1.Customer);
        const products = await productsRepository.find();
        const customers = await customersRepository.find();
        if (products.length === 0 || customers.length === 0)
            return;
        const priceRules = [
            {
                customerId: customers[0].id,
                productId: products[0].id,
                specialPrice: 450,
            },
            {
                customerId: customers[1]?.id || customers[0].id,
                productId: products[1]?.id || products[0].id,
                specialPrice: 500,
            },
        ];
        for (const rule of priceRules) {
            const exists = await priceRulesRepository.findOne({
                where: {
                    customerId: rule.customerId,
                    productId: rule.productId,
                },
            });
            if (!exists) {
                await priceRulesRepository.save(rule);
            }
        }
    }
};
exports.DatabaseInitService = DatabaseInitService;
exports.DatabaseInitService = DatabaseInitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DatabaseInitService);
//# sourceMappingURL=database-init.service.js.map