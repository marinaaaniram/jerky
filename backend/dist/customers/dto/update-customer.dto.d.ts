import { PaymentType } from '../entities/customer.entity';
export declare class UpdateCustomerDto {
    name?: string;
    phone?: string;
    address?: string;
    paymentType?: PaymentType;
    notes?: string;
    isArchived?: boolean;
}
