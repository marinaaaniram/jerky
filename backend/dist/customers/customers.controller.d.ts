import { CustomersService } from './customers.service';
import { CustomerCommentService } from './services/customer-comment.service';
import { CustomerInteractionService } from './services/customer-interaction.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerCommentDto } from './dto/create-customer-comment.dto';
import { User } from '../users/entities/user.entity';
export declare class CustomersController {
    private readonly customersService;
    private readonly commentService;
    private readonly interactionService;
    constructor(customersService: CustomersService, commentService: CustomerCommentService, interactionService: CustomerInteractionService);
    create(createCustomerDto: CreateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    findAll(includeArchived?: boolean): Promise<import("./entities/customer.entity").Customer[]>;
    findOne(id: number): Promise<import("./entities/customer.entity").Customer>;
    update(id: number, updateCustomerDto: UpdateCustomerDto, user: User): Promise<import("./entities/customer.entity").Customer>;
    archive(id: number, user: User): Promise<import("./entities/customer.entity").Customer>;
    unarchive(id: number, user: User): Promise<import("./entities/customer.entity").Customer>;
    addComment(customerId: number, createCommentDto: CreateCustomerCommentDto, user: User): Promise<import("./dto/customer-comment-response.dto").CustomerCommentResponseDto>;
    getComments(customerId: number, page?: number, limit?: number): Promise<{
        data: import("./dto/customer-comment-response.dto").CustomerCommentResponseDto[];
        total: number;
    }>;
    deleteComment(customerId: number, commentId: number, user: User): Promise<{
        success: boolean;
    }>;
    getInteractions(customerId: number, limit?: number, offset?: number): Promise<{
        data: import("./dto/customer-interaction-response.dto").CustomerInteractionResponseDto[];
        total: number;
    }>;
}
