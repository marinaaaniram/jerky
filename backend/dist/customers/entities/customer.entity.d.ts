import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { PriceRule } from '../../price-rules/entities/price-rule.entity';
export declare enum PaymentType {
    DIRECT = "\u043F\u0440\u044F\u043C\u044B\u0435",
    CONSIGNMENT = "\u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F"
}
export declare class Customer {
    id: number;
    name: string;
    address: string;
    phone: string;
    paymentType: PaymentType;
    debt: number;
    isArchived: boolean;
    orders: Order[];
    payments: Payment[];
    priceRules: PriceRule[];
    createdAt: Date;
    updatedAt: Date;
}
