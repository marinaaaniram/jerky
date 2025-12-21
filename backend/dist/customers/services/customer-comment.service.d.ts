import { Repository } from 'typeorm';
import { CustomerComment } from '../entities/customer-comment.entity';
import { CreateCustomerCommentDto } from '../dto/create-customer-comment.dto';
import { CustomerCommentResponseDto } from '../dto/customer-comment-response.dto';
export declare class CustomerCommentService {
    private commentRepository;
    constructor(commentRepository: Repository<CustomerComment>);
    create(customerId: number, userId: number, createDto: CreateCustomerCommentDto): Promise<CustomerCommentResponseDto>;
    findByCustomerId(customerId: number, page?: number, limit?: number): Promise<{
        data: CustomerCommentResponseDto[];
        total: number;
    }>;
    delete(commentId: number, userId: number, userRole?: string): Promise<void>;
    private mapToResponseDto;
}
