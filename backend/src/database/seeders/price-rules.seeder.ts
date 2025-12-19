import { DataSource } from 'typeorm';
import { PriceRule } from '../../price-rules/entities/price-rule.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';

export const seedPriceRules = async (dataSource: DataSource) => {
  const priceRulesRepository = dataSource.getRepository(PriceRule);
  const customersRepository = dataSource.getRepository(Customer);
  const productsRepository = dataSource.getRepository(Product);

  // Get customer "Точка Б (Реализация)"
  const customer = await customersRepository.findOne({
    where: { name: 'Точка Б (Реализация)' }
  });

  // Get product "Товар 1"
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
        specialPrice: 9.50, // скидка с 10.00 до 9.50
      });
    }
  }

  console.log('✅ Price rules seeded successfully');
};
