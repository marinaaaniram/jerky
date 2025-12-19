import { DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export const seedProducts = async (dataSource: DataSource) => {
  const productsRepository = dataSource.getRepository(Product);

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
