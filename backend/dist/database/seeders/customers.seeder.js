"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCustomers = void 0;
const customer_entity_1 = require("../../customers/entities/customer.entity");
const seedCustomers = async (dataSource) => {
    const customersRepository = dataSource.getRepository(customer_entity_1.Customer);
    const customers = [
        {
            name: 'Точка А (Прямые)',
            address: 'ул. Первая, 1',
            phone: '111-111-1111',
            paymentType: customer_entity_1.PaymentType.DIRECT,
            debt: 0,
            isArchived: false,
        },
        {
            name: 'Точка Б (Реализация)',
            address: 'ул. Вторая, 2',
            phone: '222-222-2222',
            paymentType: customer_entity_1.PaymentType.CONSIGNMENT,
            debt: 150.50,
            isArchived: false,
        },
        {
            name: 'Точка В (Архив)',
            address: 'ул. Архивная, 3',
            phone: '333-333-3333',
            paymentType: customer_entity_1.PaymentType.DIRECT,
            debt: 0,
            isArchived: true,
        },
    ];
    for (const customer of customers) {
        const exists = await customersRepository.findOne({ where: { name: customer.name } });
        if (!exists) {
            await customersRepository.save(customer);
        }
    }
    console.log('✅ Customers seeded successfully');
};
exports.seedCustomers = seedCustomers;
//# sourceMappingURL=customers.seeder.js.map