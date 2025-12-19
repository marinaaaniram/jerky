import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer, PaymentType } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { PriceRule } from '../price-rules/entities/price-rule.entity';
import { StockMovement, MovementReason } from '../stock-movements/entities/stock-movement.entity';
import { DeliverySurvey } from '../delivery-surveys/entities/delivery-survey.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(PriceRule)
    private priceRulesRepository: Repository<PriceRule>,
    @InjectRepository(StockMovement)
    private stockMovementsRepository: Repository<StockMovement>,
    @InjectRepository(DeliverySurvey)
    private deliverySurveysRepository: Repository<DeliverySurvey>,
    private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const customer = await this.customersRepository.findOne({
      where: { id: createOrderDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${createOrderDto.customerId} not found`,
      );
    }

    const order = this.ordersRepository.create({
      customerId: createOrderDto.customerId,
      orderDate: new Date(),
      status: OrderStatus.NEW,
      notes: createOrderDto.notes,
    });

    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'orderItems', 'orderItems.product'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'orderItems', 'orderItems.product', 'deliverySurvey'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async addItem(orderId: number, addItemDto: AddItemDto): Promise<OrderItem> {
    const order = await this.findOne(orderId);

    if (order.status === OrderStatus.DELIVERED) {
      throw new ForbiddenException('Cannot modify delivered orders');
    }

    const product = await this.productsRepository.findOne({
      where: { id: addItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${addItemDto.productId} not found`,
      );
    }

    // Check for special price rule
    const priceRule = await this.priceRulesRepository.findOne({
      where: {
        customerId: order.customerId,
        productId: addItemDto.productId,
      },
    });

    const price = priceRule ? priceRule.specialPrice : product.price;

    // Check if item already exists in order
    const existingItem = await this.orderItemsRepository.findOne({
      where: {
        orderId: orderId,
        productId: addItemDto.productId,
      },
    });

    if (existingItem) {
      existingItem.quantity += addItemDto.quantity;
      return this.orderItemsRepository.save(existingItem);
    }

    const orderItem = this.orderItemsRepository.create({
      orderId: orderId,
      productId: addItemDto.productId,
      quantity: addItemDto.quantity,
      price: price,
    });

    return this.orderItemsRepository.save(orderItem);
  }

  async updateStatus(
    orderId: number,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status === OrderStatus.DELIVERED) {
      throw new ForbiddenException('Cannot modify delivered orders');
    }

    // If transitioning to DELIVERED, perform transaction
    if (updateStatusDto.status === OrderStatus.DELIVERED) {
      return this.deliverOrder(orderId);
    }

    // Simple status update for other statuses
    order.status = updateStatusDto.status;
    return this.ordersRepository.save(order);
  }

  private async deliverOrder(orderId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['customer', 'orderItems', 'orderItems.product'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // Check if delivery survey exists
      const deliverySurvey = await queryRunner.manager.findOne(DeliverySurvey, {
        where: { orderId: orderId },
      });

      if (!deliverySurvey) {
        throw new BadRequestException(
          'Delivery survey is required before marking order as delivered',
        );
      }

      // Update order status
      order.status = OrderStatus.DELIVERED;
      await queryRunner.manager.save(order);

      // Calculate order total
      const orderTotal = order.orderItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );

      // Update customer debt if payment type is consignment
      if (order.customer.paymentType === PaymentType.CONSIGNMENT) {
        order.customer.debt += orderTotal;
        await queryRunner.manager.save(order.customer);
      }

      // Update stock and create stock movements for each item
      for (const item of order.orderItems) {
        const product = item.product;

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Required: ${item.quantity}`,
          );
        }

        // Update stock
        product.stockQuantity -= item.quantity;
        await queryRunner.manager.save(product);

        // Create stock movement
        const stockMovement = queryRunner.manager.create(StockMovement, {
          productId: product.id,
          quantity: -item.quantity,
          reason: MovementReason.SALE,
          notes: `Заказ #${order.id} доставлен`,
        });
        await queryRunner.manager.save(stockMovement);
      }

      await queryRunner.commitTransaction();

      return this.findOne(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTotal(orderId: number): Promise<number> {
    const order = await this.findOne(orderId);

    return order.orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.DELIVERED) {
      throw new ForbiddenException('Cannot delete delivered orders');
    }

    await this.ordersRepository.remove(order);
  }
}
