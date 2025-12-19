import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: createPaymentDto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${createPaymentDto.customerId} not found`,
        );
      }

      // Create payment
      const payment = queryRunner.manager.create(Payment, {
        customerId: createPaymentDto.customerId,
        amount: createPaymentDto.amount,
        notes: createPaymentDto.notes,
      });
      await queryRunner.manager.save(payment);

      // Update customer debt
      customer.debt -= createPaymentDto.amount;
      await queryRunner.manager.save(customer);

      await queryRunner.commitTransaction();

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(customerId?: number): Promise<Payment[]> {
    const query = this.paymentsRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.customer', 'customer')
      .orderBy('payment.createdAt', 'DESC');

    if (customerId) {
      query.where('payment.customerId = :customerId', { customerId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }
}
