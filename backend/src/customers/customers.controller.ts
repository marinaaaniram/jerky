import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
  Delete,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerCommentService } from './services/customer-comment.service';
import { CustomerInteractionService } from './services/customer-interaction.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerCommentDto } from './dto/create-customer-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly commentService: CustomerCommentService,
    private readonly interactionService: CustomerInteractionService,
  ) {}

  @Post()
  @Roles('Руководитель', 'Менеджер по продажам')
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Query('includeArchived', new ParseBoolPipe({ optional: true })) includeArchived?: boolean) {
    return this.customersService.findAll(includeArchived);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles('Руководитель', 'Менеджер по продажам')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: User,
  ) {
    return this.customersService.update(id, updateCustomerDto, user.id);
  }

  @Patch(':id/archive')
  @Roles('Руководитель', 'Менеджер по продажам')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.customersService.archive(id, user.id);
  }

  @Patch(':id/unarchive')
  @Roles('Руководитель', 'Менеджер по продажам')
  async unarchive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.customersService.unarchive(id, user.id);
  }

  // Comments endpoints
  @Post(':id/comments')
  @Roles('Руководитель', 'Менеджер по продажам')
  async addComment(
    @Param('id', ParseIntPipe) customerId: number,
    @Body() createCommentDto: CreateCustomerCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.create(customerId, user.id, createCommentDto);
  }

  @Get(':id/comments')
  @Roles('Руководитель', 'Менеджер по продажам')
  async getComments(
    @Param('id', ParseIntPipe) customerId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.commentService.findByCustomerId(customerId, page, limit);
  }

  @Delete(':id/comments/:commentId')
  @Roles('Руководитель', 'Менеджер по продажам')
  async deleteComment(
    @Param('id', ParseIntPipe) customerId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser() user: User,
  ) {
    await this.commentService.delete(commentId, user.id, user.role?.name);
    return { success: true };
  }

  // Interactions (history) endpoints
  @Get(':id/interactions')
  @Roles('Руководитель', 'Менеджер по продажам')
  async getInteractions(
    @Param('id', ParseIntPipe) customerId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ) {
    return this.interactionService.findByCustomerId(customerId, limit, offset);
  }
}
