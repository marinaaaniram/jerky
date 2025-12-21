import { Repository, DataSource } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CancelMovementDto } from './dto/cancel-movement.dto';
export declare class StockMovementsService {
    private stockMovementsRepository;
    private productsRepository;
    private dataSource;
    constructor(stockMovementsRepository: Repository<StockMovement>, productsRepository: Repository<Product>, dataSource: DataSource);
    create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement>;
    findAll(productId?: number): Promise<StockMovement[]>;
    findOne(id: number): Promise<StockMovement>;
    adjustStock(productId: number, adjustStockDto: AdjustStockDto, currentUser: User): Promise<StockMovement>;
    cancelMovement(movementId: number, cancelMovementDto: CancelMovementDto, currentUser: User): Promise<StockMovement>;
    getProductHistory(productId: number): Promise<StockMovement[]>;
    getActiveMovements(productId?: number): Promise<StockMovement[]>;
}
