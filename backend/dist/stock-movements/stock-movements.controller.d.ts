import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    create(createStockMovementDto: CreateStockMovementDto): Promise<import("./entities/stock-movement.entity").StockMovement>;
    findAll(productId?: number): Promise<import("./entities/stock-movement.entity").StockMovement[]>;
    findOne(id: number): Promise<import("./entities/stock-movement.entity").StockMovement>;
}
