import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerInteractionService } from './services/customer-interaction.service';
export declare class CustomersService {
    private customersRepository;
    private interactionService;
    constructor(customersRepository: Repository<Customer>, interactionService: CustomerInteractionService);
    create(createCustomerDto: CreateCustomerDto): Promise<Customer>;
    findAll(includeArchived?: boolean): Promise<Customer[]>;
    findOne(id: number): Promise<Customer>;
    update(id: number, updateCustomerDto: UpdateCustomerDto, userId?: number): Promise<Customer>;
    archive(id: number, userId?: number): Promise<Customer>;
    unarchive(id: number, userId?: number): Promise<Customer>;
    updateDebt(id: number, amount: number): Promise<Customer>;
}
