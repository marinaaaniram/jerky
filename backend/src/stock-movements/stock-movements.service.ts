import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementsRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: createStockMovementDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createStockMovementDto.productId} not found`,
        );
      }

      const newQuantity = product.stockQuantity + createStockMovementDto.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stockQuantity}, Requested: ${Math.abs(createStockMovementDto.quantity)}`,
        );
      }

      // Create stock movement
      const stockMovement = queryRunner.manager.create(StockMovement, createStockMovementDto);
      await queryRunner.manager.save(stockMovement);

      // Update product stock
      product.stockQuantity = newQuantity;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();

      return stockMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(productId?: number): Promise<StockMovement[]> {
    const query = this.stockMovementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .orderBy('movement.createdAt', 'DESC');

    if (productId) {
      query.where('movement.productId = :productId', { productId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<StockMovement> {
    const movement = await this.stockMovementsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }

    return movement;
  }
}
