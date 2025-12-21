import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
export interface SearchResult {
    type: 'order' | 'customer' | 'product';
    id: number;
    title: string;
    description: string;
    icon?: string;
    url: string;
    status?: string;
    customer?: string;
    notes?: string;
}
export declare class SearchService {
    private ordersRepository;
    private customersRepository;
    private productsRepository;
    constructor(ordersRepository: Repository<Order>, customersRepository: Repository<Customer>, productsRepository: Repository<Product>);
    globalSearch(query: string, limit?: number): Promise<SearchResult[]>;
}
