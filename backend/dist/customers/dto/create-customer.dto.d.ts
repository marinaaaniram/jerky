import { PaymentType } from '../entities/customer.entity';
export declare class CreateCustomerDto {
    name: string;
    phone?: string;
    address?: string;
    paymentType: PaymentType;
    notes?: string;
}
