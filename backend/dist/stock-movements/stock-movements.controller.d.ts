import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CancelMovementDto } from './dto/cancel-movement.dto';
import { User } from '../users/entities/user.entity';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    create(createStockMovementDto: CreateStockMovementDto): Promise<import("./entities/stock-movement.entity").StockMovement>;
    findAll(productId?: number): Promise<import("./entities/stock-movement.entity").StockMovement[]>;
    findOne(id: number): Promise<import("./entities/stock-movement.entity").StockMovement>;
    adjustStock(productId: number, adjustStockDto: AdjustStockDto, currentUser: User): Promise<import("./entities/stock-movement.entity").StockMovement>;
    cancelMovement(id: number, cancelMovementDto: CancelMovementDto, currentUser: User): Promise<import("./entities/stock-movement.entity").StockMovement>;
    getProductHistory(productId: number): Promise<import("./entities/stock-movement.entity").StockMovement[]>;
}
