import { Repository, DataSource } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockMovementsService {
    private stockMovementsRepository;
    private productsRepository;
    private dataSource;
    constructor(stockMovementsRepository: Repository<StockMovement>, productsRepository: Repository<Product>, dataSource: DataSource);
    create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement>;
    findAll(productId?: number): Promise<StockMovement[]>;
    findOne(id: number): Promise<StockMovement>;
}
