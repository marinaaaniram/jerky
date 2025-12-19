"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedOrders = void 0;
const order_entity_1 = require("../../orders/entities/order.entity");
const order_item_entity_1 = require("../../orders/entities/order-item.entity");
const seedOrders = async (dataSource) => {
    const ordersRepository = dataSource.getRepository(order_entity_1.Order);
    const orderItemsRepository = dataSource.getRepository(order_item_entity_1.OrderItem);
    const existingOrders = await ordersRepository.find();
    if (existingOrders.length > 0) {
        console.log('ℹ️  Orders already seeded, skipping...');
        return;
    }
    const orders = [
        {
            customerId: 1,
            orderDate: new Date('2025-12-19'),
            status: order_entity_1.OrderStatus.NEW,
            notes: 'Тестовый заказ 1',
        },
        {
            customerId: 2,
            orderDate: new Date('2025-12-18'),
            status: order_entity_1.OrderStatus.ASSEMBLING,
            notes: 'Тестовый заказ 2 - реализация',
        },
        {
            customerId: 1,
            orderDate: new Date('2025-12-17'),
            status: order_entity_1.OrderStatus.DELIVERED,
            notes: 'Уже доставленный заказ',
        },
    ];
    for (const orderData of orders) {
        const order = await ordersRepository.save(orderData);
        if (order.id === 1) {
            await orderItemsRepository.save([
                {
                    orderId: order.id,
                    productId: 1,
                    quantity: 2,
                    price: 500,
                },
                {
                    orderId: order.id,
                    productId: 2,
                    quantity: 1,
                    price: 550,
                },
            ]);
        }
        else if (order.id === 2) {
            await orderItemsRepository.save([
                {
                    orderId: order.id,
                    productId: 2,
                    quantity: 3,
                    price: 550,
                },
                {
                    orderId: order.id,
                    productId: 3,
                    quantity: 2,
                    price: 450,
                },
            ]);
        }
        else if (order.id === 3) {
            await orderItemsRepository.save([
                {
                    orderId: order.id,
                    productId: 1,
                    quantity: 1,
                    price: 500,
                },
            ]);
        }
    }
    console.log('✅ Orders seeded successfully');
};
exports.seedOrders = seedOrders;
//# sourceMappingURL=orders.seeder.js.map