import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerInteractionService } from './services/customer-interaction.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private interactionService: CustomerInteractionService,
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

  async update(id: number, updateCustomerDto: UpdateCustomerDto, userId?: number): Promise<Customer> {
    const oldCustomer = await this.findOne(id);

    // Track changes
    const changes: Record<string, { old: any; new: any }> = {};
    for (const [key, newValue] of Object.entries(updateCustomerDto)) {
      if (oldCustomer[key] !== newValue && newValue !== undefined) {
        changes[key] = {
          old: oldCustomer[key],
          new: newValue,
        };
      }
    }

    await this.customersRepository.update(id, updateCustomerDto);

    const updatedCustomer = await this.findOne(id);

    // Log changes if any
    if (Object.keys(changes).length > 0) {
      await this.interactionService.logCustomerDataUpdated(id, changes, userId);
    }

    return updatedCustomer;
  }

  async archive(id: number, userId?: number): Promise<Customer> {
    const customer = await this.findOne(id);

    customer.isArchived = true;
    const archived = await this.customersRepository.save(customer);

    // Log archiving
    await this.interactionService.logArchived(id, userId);

    return archived;
  }

  async unarchive(id: number, userId?: number): Promise<Customer> {
    const customer = await this.findOne(id);

    customer.isArchived = false;
    const unarchived = await this.customersRepository.save(customer);

    // Log unarchiving
    await this.interactionService.logUnarchived(id, userId);

    return unarchived;
  }

  async updateDebt(id: number, amount: number): Promise<Customer> {
    const customer = await this.findOne(id);

    customer.debt += amount;
    await this.customersRepository.save(customer);

    return customer;
  }
}
