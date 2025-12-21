import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('Руководитель', 'Кладовщик')
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/items')
  @Roles('Руководитель', 'Кладовщик')
  async addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemDto: AddItemDto,
  ) {
    return this.ordersService.addItem(id, addItemDto);
  }

  @Patch(':id/status')
  @Roles('Руководитель', 'Кладовщик', 'Курьер')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Get(':id/total')
  async getTotal(@Param('id', ParseIntPipe) id: number) {
    const total = await this.ordersService.getTotal(id);
    return { total };
  }

  @Delete(':id')
  @Roles('Руководитель')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
