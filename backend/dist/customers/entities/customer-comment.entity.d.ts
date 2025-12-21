import { Customer } from './customer.entity';
import { User } from '../../users/entities/user.entity';
export declare class CustomerComment {
    id: number;
    customerId: number;
    customer: Customer;
    userId: number;
    user: User;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
