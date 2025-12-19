import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { DeliverySurvey } from '../../delivery-surveys/entities/delivery-survey.entity';
export declare enum OrderStatus {
    NEW = "\u041D\u043E\u0432\u044B\u0439",
    ASSEMBLING = "\u0412 \u0441\u0431\u043E\u0440\u043A\u0435",
    TRANSFERRED = "\u041F\u0435\u0440\u0435\u0434\u0430\u043D \u043A\u0443\u0440\u044C\u0435\u0440\u0443",
    DELIVERED = "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D"
}
export declare class Order {
    id: number;
    customerId: number;
    customer: Customer;
    orderDate: Date;
    status: OrderStatus;
    notes: string;
    orderItems: OrderItem[];
    deliverySurvey: DeliverySurvey;
    createdAt: Date;
    updatedAt: Date;
}
