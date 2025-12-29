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
import { CustomerInteractionService } from '../customers/services/customer-interaction.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignCourierDto } from './dto/assign-courier.dto';
import { User } from '../users/entities/user.entity';

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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private interactionService: CustomerInteractionService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId?: number): Promise<Order> {
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
      userId,
      orderDate: new Date(),
      status: OrderStatus.NEW,
      notes: createOrderDto.notes,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Log interaction
    await this.interactionService.logOrderCreated(
      createOrderDto.customerId,
      savedOrder.id,
      userId,
    );

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'user', 'orderItems', 'orderItems.product'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'user', 'orderItems', 'orderItems.product', 'deliverySurvey'],
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
    currentUser?: User,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.status === OrderStatus.DELIVERED) {
      throw new ForbiddenException('Cannot modify delivered orders');
    }

    // Linear status transitions validation
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.NEW]: [OrderStatus.ASSEMBLING],
      [OrderStatus.ASSEMBLING]: [OrderStatus.TRANSFERRED],
      [OrderStatus.TRANSFERRED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // No transitions from DELIVERED
    };

    const allowedNextStatuses = validTransitions[order.status];
    if (!allowedNextStatuses.includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${order.status}" to "${updateStatusDto.status}". ` +
        `Valid next statuses: ${allowedNextStatuses.join(', ')}`,
      );
    }

    // If transitioning to DELIVERED, perform transaction
    if (updateStatusDto.status === OrderStatus.DELIVERED) {
      // Check if current user is the assigned courier
      if (currentUser && order.userId && order.userId !== currentUser.id) {
        throw new ForbiddenException('Only the assigned courier can mark order as delivered');
      }
      // Check if order is in TRANSFERRED status (already validated above, but double-check)
      if (order.status !== OrderStatus.TRANSFERRED) {
        throw new BadRequestException('Order must be in "Передан курьеру" status before marking as delivered');
      }
      return this.deliverOrder(orderId);
    }

    // If transitioning to TRANSFERRED, check that courier is assigned
    if (updateStatusDto.status === OrderStatus.TRANSFERRED) {
      if (!order.userId) {
        throw new BadRequestException('Courier must be assigned before transferring order');
      }
      // Check if order is in ASSEMBLING status (already validated above, but double-check)
      if (order.status !== OrderStatus.ASSEMBLING) {
        throw new BadRequestException('Order must be in "В сборке" status before transferring to courier');
      }
    }

    // If transitioning to ASSEMBLING, check if order is in NEW status (already validated above)
    if (updateStatusDto.status === OrderStatus.ASSEMBLING) {
      if (order.status !== OrderStatus.NEW) {
        throw new BadRequestException('Order must be in "Новый" status before starting assembly');
      }
    }

    // Simple status update for valid transitions
    order.status = updateStatusDto.status;
    return this.ordersRepository.save(order);
  }

  async assignCourier(
    orderId: number,
    assignCourierDto: AssignCourierDto,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    // Can only assign courier to orders in NEW or ASSEMBLING status
    if (order.status !== OrderStatus.NEW && order.status !== OrderStatus.ASSEMBLING) {
      throw new BadRequestException(
        'Courier can only be assigned to orders in "Новый" or "В сборке" status',
      );
    }

    // Verify that the user is a courier (role name is "Курьер")
    const user = await this.usersRepository.findOne({
      where: { id: assignCourierDto.userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${assignCourierDto.userId} not found`);
    }

    if (user.role.name !== 'Курьер') {
      throw new BadRequestException('User must have "Курьер" role');
    }

    order.userId = assignCourierDto.userId;
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

      // Log interaction outside transaction
      await this.interactionService.logOrderDelivered(order.customerId, orderId);

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
