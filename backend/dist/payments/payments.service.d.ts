import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerInteractionService } from '../customers/services/customer-interaction.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private paymentsRepository;
    private customersRepository;
    private dataSource;
    private interactionService;
    constructor(paymentsRepository: Repository<Payment>, customersRepository: Repository<Customer>, dataSource: DataSource, interactionService: CustomerInteractionService);
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findAll(customerId?: number): Promise<Payment[]>;
    findOne(id: number): Promise<Payment>;
}
