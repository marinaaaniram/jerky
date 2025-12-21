import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { User } from '../users/entities/user.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, user: User): Promise<import("./entities/order.entity").Order>;
    findAll(): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: number): Promise<import("./entities/order.entity").Order>;
    addItem(id: number, addItemDto: AddItemDto): Promise<import("./entities/order-item.entity").OrderItem>;
    updateStatus(id: number, updateStatusDto: UpdateStatusDto): Promise<import("./entities/order.entity").Order>;
    getTotal(id: number): Promise<{
        total: number;
    }>;
    remove(id: number): Promise<void>;
}
