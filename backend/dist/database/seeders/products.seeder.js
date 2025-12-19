"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProducts = void 0;
const product_entity_1 = require("../../products/entities/product.entity");
const seedProducts = async (dataSource) => {
    const productsRepository = dataSource.getRepository(product_entity_1.Product);
    const products = [
        {
            name: 'Товар 1',
            price: 10.00,
            stockQuantity: 100,
        },
        {
            name: 'Товар 2',
            price: 20.00,
            stockQuantity: 50,
        },
        {
            name: 'Товар 3',
            price: 15.50,
            stockQuantity: 75,
        },
        {
            name: 'Товар 4',
            price: 25.00,
            stockQuantity: 30,
        },
    ];
    for (const product of products) {
        const exists = await productsRepository.findOne({ where: { name: product.name } });
        if (!exists) {
            await productsRepository.save(product);
        }
    }
    console.log('✅ Products seeded successfully');
};
exports.seedProducts = seedProducts;
//# sourceMappingURL=products.seeder.js.map