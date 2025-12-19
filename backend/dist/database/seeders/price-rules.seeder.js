"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPriceRules = void 0;
const price_rule_entity_1 = require("../../price-rules/entities/price-rule.entity");
const customer_entity_1 = require("../../customers/entities/customer.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const seedPriceRules = async (dataSource) => {
    const priceRulesRepository = dataSource.getRepository(price_rule_entity_1.PriceRule);
    const customersRepository = dataSource.getRepository(customer_entity_1.Customer);
    const productsRepository = dataSource.getRepository(product_entity_1.Product);
    const customer = await customersRepository.findOne({
        where: { name: 'Точка Б (Реализация)' }
    });
    const product = await productsRepository.findOne({
        where: { name: 'Товар 1' }
    });
    if (customer && product) {
        const exists = await priceRulesRepository.findOne({
            where: { customerId: customer.id, productId: product.id }
        });
        if (!exists) {
            await priceRulesRepository.save({
                customerId: customer.id,
                productId: product.id,
                specialPrice: 9.50,
            });
        }
    }
    console.log('✅ Price rules seeded successfully');
};
exports.seedPriceRules = seedPriceRules;
//# sourceMappingURL=price-rules.seeder.js.map