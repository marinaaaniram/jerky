import { Order } from '../../orders/entities/order.entity';
export declare class ActOfServicesTemplate {
    private order;
    constructor(order: Order);
    generate(): string;
}
