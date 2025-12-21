import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerComment } from '../entities/customer-comment.entity';
import { CreateCustomerCommentDto } from '../dto/create-customer-comment.dto';
import { CustomerCommentResponseDto } from '../dto/customer-comment-response.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class CustomerCommentService {
  constructor(
    @InjectRepository(CustomerComment)
    private commentRepository: Repository<CustomerComment>,
  ) {}

  async create(
    customerId: number,
    userId: number,
    createDto: CreateCustomerCommentDto,
  ): Promise<CustomerCommentResponseDto> {
    const comment = this.commentRepository.create({
      customerId,
      userId,
      content: createDto.content,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Reload to get user data
    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    if (!fullComment) {
      throw new Error('Failed to load saved comment');
    }

    return this.mapToResponseDto(fullComment);
  }

  async findByCustomerId(
    customerId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: CustomerCommentResponseDto[]; total: number }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { customerId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: comments.map(c => this.mapToResponseDto(c)),
      total,
    };
  }

  async delete(commentId: number, userId: number, userRole?: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Only comment author or admin can delete
    const isAdmin = userRole === 'Руководитель';
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.delete(commentId);
  }

  private mapToResponseDto(comment: CustomerComment): CustomerCommentResponseDto {
    return new CustomerCommentResponseDto({
      id: comment.id,
      content: comment.content,
      user: {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        email: comment.user.email,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  }
}
