import { Customer } from '../../customers/entities/customer.entity';
export declare class Payment {
    id: number;
    customerId: number;
    customer: Customer;
    amount: number;
    paymentDate: Date;
    createdAt: Date;
}
