import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { PriceRule } from '../price-rules/entities/price-rule.entity';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      await this.seedDatabase();
    }
  }

  private async seedDatabase() {
    try {
      await this.seedRoles();
      await this.seedUsers();
      await this.seedCustomers();
      await this.seedProducts();
      await this.seedPriceRules();
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
    }
  }

  private async seedRoles() {
    const rolesRepository = this.dataSource.getRepository(Role);
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

  private async seedUsers() {
    const usersRepository = this.dataSource.getRepository(User);
    const rolesRepository = this.dataSource.getRepository(Role);

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

  private async seedCustomers() {
    const customersRepository = this.dataSource.getRepository(Customer);
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

  private async seedProducts() {
    const productsRepository = this.dataSource.getRepository(Product);
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

  private async seedPriceRules() {
    const priceRulesRepository = this.dataSource.getRepository(PriceRule);
    const productsRepository = this.dataSource.getRepository(Product);
    const customersRepository = this.dataSource.getRepository(Customer);

    const products = await productsRepository.find();
    const customers = await customersRepository.find();

    if (products.length === 0 || customers.length === 0) return;

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
}
