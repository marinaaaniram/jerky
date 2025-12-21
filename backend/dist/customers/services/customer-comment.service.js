"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerCommentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_comment_entity_1 = require("../entities/customer-comment.entity");
const customer_comment_response_dto_1 = require("../dto/customer-comment-response.dto");
let CustomerCommentService = class CustomerCommentService {
    commentRepository;
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
    }
    async create(customerId, userId, createDto) {
        const comment = this.commentRepository.create({
            customerId,
            userId,
            content: createDto.content,
        });
        const savedComment = await this.commentRepository.save(comment);
        const fullComment = await this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['user'],
        });
        if (!fullComment) {
            throw new Error('Failed to load saved comment');
        }
        return this.mapToResponseDto(fullComment);
    }
    async findByCustomerId(customerId, page = 1, limit = 20) {
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
    async delete(commentId, userId, userRole) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${commentId} not found`);
        }
        const isAdmin = userRole === 'Руководитель';
        if (comment.userId !== userId && !isAdmin) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.commentRepository.delete(commentId);
    }
    mapToResponseDto(comment) {
        return new customer_comment_response_dto_1.CustomerCommentResponseDto({
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
};
exports.CustomerCommentService = CustomerCommentService;
exports.CustomerCommentService = CustomerCommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_comment_entity_1.CustomerComment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomerCommentService);
//# sourceMappingURL=customer-comment.service.js.map