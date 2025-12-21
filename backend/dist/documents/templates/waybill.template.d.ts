import { Order } from '../../orders/entities/order.entity';
export declare class WaybillTemplate {
    private order;
    constructor(order: Order);
    generate(): string;
}
