import { DataSource } from 'typeorm';
import { Customer, PaymentType } from '../../customers/entities/customer.entity';

export const seedCustomers = async (dataSource: DataSource) => {
  const customersRepository = dataSource.getRepository(Customer);

  const customers = [
    {
      name: 'Точка А (Прямые)',
      address: 'ул. Первая, 1',
      phone: '111-111-1111',
      paymentType: PaymentType.DIRECT,
      debt: 0,
      isArchived: false,
    },
    {
      name: 'Точка Б (Реализация)',
      address: 'ул. Вторая, 2',
      phone: '222-222-2222',
      paymentType: PaymentType.CONSIGNMENT,
      debt: 150.50,
      isArchived: false,
    },
    {
      name: 'Точка В (Архив)',
      address: 'ул. Архивная, 3',
      phone: '333-333-3333',
      paymentType: PaymentType.DIRECT,
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
