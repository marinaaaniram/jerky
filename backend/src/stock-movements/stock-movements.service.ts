import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockMovement, MovementReason } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CancelMovementDto } from './dto/cancel-movement.dto';

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

  async adjustStock(
    productId: number,
    adjustStockDto: AdjustStockDto,
    currentUser: User,
  ): Promise<StockMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      if (adjustStockDto.newQuantity < 0) {
        throw new BadRequestException(
          `Stock quantity cannot be negative. Requested: ${adjustStockDto.newQuantity}`,
        );
      }

      // Calculate the difference
      const quantityChange = adjustStockDto.newQuantity - product.stockQuantity;

      // Create stock movement
      const stockMovement = queryRunner.manager.create(StockMovement, {
        productId,
        quantityChange,
        reason: adjustStockDto.reason,
        reasonText: adjustStockDto.reasonText,
        movementDate: new Date(),
        userId: currentUser.id,
        isActive: true,
      });
      await queryRunner.manager.save(stockMovement);

      // Update product stock
      product.stockQuantity = adjustStockDto.newQuantity;
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

  async cancelMovement(
    movementId: number,
    cancelMovementDto: CancelMovementDto,
    currentUser: User,
  ): Promise<StockMovement> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const originalMovement = await queryRunner.manager.findOne(StockMovement, {
        where: { id: movementId },
        relations: ['product'],
      });

      if (!originalMovement) {
        throw new NotFoundException(
          `Stock movement with ID ${movementId} not found`,
        );
      }

      if (originalMovement.cancelledBy) {
        throw new BadRequestException(
          `Stock movement with ID ${movementId} is already cancelled`,
        );
      }

      // Mark original movement as cancelled
      originalMovement.cancelledBy = currentUser.id;
      originalMovement.isActive = false;
      await queryRunner.manager.save(originalMovement);

      // Create reverse movement
      const reverseMovement = queryRunner.manager.create(StockMovement, {
        productId: originalMovement.productId,
        quantityChange: -originalMovement.quantityChange,
        reason: MovementReason.CORRECTION,
        reasonText: `Отмена операции #${movementId}. ${cancelMovementDto.reason || ''}`.trim(),
        movementDate: new Date(),
        userId: currentUser.id,
        isActive: true,
      });
      await queryRunner.manager.save(reverseMovement);

      // Update product stock by applying reverse movement
      const product = originalMovement.product;
      product.stockQuantity += reverseMovement.quantityChange;

      if (product.stockQuantity < 0) {
        throw new BadRequestException(
          `Cannot cancel movement: would result in negative stock`,
        );
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();

      return reverseMovement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductHistory(productId: number): Promise<StockMovement[]> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.stockMovementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.user', 'user')
      .leftJoinAndSelect('movement.cancelledByUser', 'cancelledByUser')
      .where('movement.productId = :productId', { productId })
      .orderBy('movement.createdAt', 'DESC')
      .getMany();
  }

  async getActiveMovements(productId?: number): Promise<StockMovement[]> {
    const query = this.stockMovementsRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.user', 'user')
      .where('movement.isActive = :isActive', { isActive: true })
      .orderBy('movement.createdAt', 'DESC');

    if (productId) {
      query.andWhere('movement.productId = :productId', { productId });
    }

    return query.getMany();
  }
}
