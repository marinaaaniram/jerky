import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create({
      ...createCustomerDto,
      debt: 0,
      isArchived: false,
    });

    return this.customersRepository.save(customer);
  }

  async findAll(includeArchived = false): Promise<Customer[]> {
    const query = this.customersRepository.createQueryBuilder('customer');

    if (!includeArchived) {
      query.where('customer.isArchived = :isArchived', { isArchived: false });
    }

    return query.orderBy('customer.name', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    await this.customersRepository.update(id, updateCustomerDto);

    return this.findOne(id);
  }

  async archive(id: number): Promise<Customer> {
    const customer = await this.findOne(id);

    customer.isArchived = true;
    await this.customersRepository.save(customer);

    return customer;
  }

  async updateDebt(id: number, amount: number): Promise<Customer> {
    const customer = await this.findOne(id);

    customer.debt += amount;
    await this.customersRepository.save(customer);

    return customer;
  }
}
