import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    findAll(customerId?: number): Promise<import("./entities/payment.entity").Payment[]>;
    findOne(id: number): Promise<import("./entities/payment.entity").Payment>;
}
