import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';

export interface SearchResult {
  type: 'order' | 'customer' | 'product';
  id: number;
  title: string;
  description: string;
  icon?: string;
  url: string;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async globalSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    try {
      // Search in Orders by ID or notes
      const whereConditions: any[] = [];

      if (/^\d+$/.test(query)) {
        whereConditions.push({ id: parseInt(query, 10) });
      }

      whereConditions.push({ notes: ILike(searchTerm) });

      const orders = await this.ordersRepository.find({
        where: whereConditions.length > 0 ? whereConditions : undefined,
        relations: ['customer'],
        take: 3,
      });

      orders.forEach((order) => {
        const description = order.notes
          ? `${order.customer?.name || 'Неизвестный'} | ${order.status} | "${order.notes.substring(0, 40)}${order.notes.length > 40 ? '...' : ''}"`
          : `Клиент: ${order.customer?.name || 'Неизвестный'} | Статус: ${order.status}`;

        results.push({
          type: 'order',
          id: order.id,
          title: `Заказ #${order.id}`,
          description,
          icon: '📦',
          url: `/orders/${order.id}`,
        });
      });

      // Search in Customers by name or phone
      const customers = await this.customersRepository.find({
        where: [
          { name: ILike(searchTerm) },
          { phone: ILike(searchTerm) },
        ],
        take: 3,
      });

      customers.forEach((customer) => {
        results.push({
          type: 'customer',
          id: customer.id,
          title: customer.name,
          description: `${customer.phone || 'Телефон не указан'} | ${customer.paymentType}`,
          icon: '👤',
          url: `/customers/${customer.id}`,
        });
      });

      // Search in Products by name
      const products = await this.productsRepository.find({
        where: { name: ILike(searchTerm) },
        take: 3,
      });

      products.forEach((product) => {
        results.push({
          type: 'product',
          id: product.id,
          title: product.name,
          description: `Цена: ${product.price}₽ | Склад: ${product.stockQuantity} шт`,
          icon: '📦',
          url: `/products/${product.id}`,
        });
      });
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }

    return results.slice(0, limit);
  }
}
