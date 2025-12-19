import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

export const seedOrders = async (dataSource: DataSource) => {
  const ordersRepository = dataSource.getRepository(Order);
  const orderItemsRepository = dataSource.getRepository(OrderItem);

  // Check if orders already exist
  const existingOrders = await ordersRepository.find();
  if (existingOrders.length > 0) {
    console.log('ℹ️  Orders already seeded, skipping...');
    return;
  }

  const orders = [
    {
      customerId: 1,
      orderDate: new Date('2025-12-19'),
      status: OrderStatus.NEW,
      notes: 'Тестовый заказ 1',
    },
    {
      customerId: 2,
      orderDate: new Date('2025-12-18'),
      status: OrderStatus.ASSEMBLING,
      notes: 'Тестовый заказ 2 - реализация',
    },
    {
      customerId: 1,
      orderDate: new Date('2025-12-17'),
      status: OrderStatus.DELIVERED,
      notes: 'Уже доставленный заказ',
    },
  ];

  for (const orderData of orders) {
    const order = await ordersRepository.save(orderData);

    // Add items to orders
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
    } else if (order.id === 2) {
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
    } else if (order.id === 3) {
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
