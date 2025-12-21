import { Repository } from 'typeorm';
import { CustomerInteraction } from '../entities/customer-interaction.entity';
import { CustomerInteractionResponseDto } from '../dto/customer-interaction-response.dto';
export declare class CustomerInteractionService {
    private interactionRepository;
    constructor(interactionRepository: Repository<CustomerInteraction>);
    logOrderCreated(customerId: number, orderId: number, userId?: number): Promise<void>;
    logOrderDelivered(customerId: number, orderId: number, userId?: number): Promise<void>;
    logPaymentReceived(customerId: number, amount: number, userId?: number): Promise<void>;
    logCustomerDataUpdated(customerId: number, changes: Record<string, {
        old: any;
        new: any;
    }>, userId?: number): Promise<void>;
    logArchived(customerId: number, userId?: number): Promise<void>;
    logUnarchived(customerId: number, userId?: number): Promise<void>;
    findByCustomerId(customerId: number, limit?: number, offset?: number): Promise<{
        data: CustomerInteractionResponseDto[];
        total: number;
    }>;
    private mapToResponseDto;
}
