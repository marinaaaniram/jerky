import { Order } from '../../orders/entities/order.entity';
export declare class DeliverySurvey {
    id: number;
    orderId: number;
    order: Order;
    photoUrl: string;
    stockCheckNotes: string;
    layoutNotes: string;
    otherNotes: string;
    timestamp: Date;
    createdAt: Date;
}
