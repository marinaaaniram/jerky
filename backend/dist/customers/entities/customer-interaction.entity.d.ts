import { Customer } from './customer.entity';
import { User } from '../../users/entities/user.entity';
export declare enum CustomerInteractionType {
    ORDER_CREATED = "ORDER_CREATED",
    ORDER_DELIVERED = "ORDER_DELIVERED",
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
    CUSTOMER_DATA_UPDATED = "CUSTOMER_DATA_UPDATED",
    ARCHIVED = "ARCHIVED",
    UNARCHIVED = "UNARCHIVED"
}
export declare class CustomerInteraction {
    id: number;
    customerId: number;
    customer: Customer;
    userId?: number;
    user?: User;
    type: CustomerInteractionType;
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
