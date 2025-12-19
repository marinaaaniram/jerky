import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CancelMovementDto } from './dto/cancel-movement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @Roles('Руководитель', 'Кладовщик')
  async create(@Body() createStockMovementDto: CreateStockMovementDto) {
    return this.stockMovementsService.create(createStockMovementDto);
  }

  @Get()
  async findAll(@Query('productId', new ParseIntPipe({ optional: true })) productId?: number) {
    return this.stockMovementsService.findAll(productId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.findOne(id);
  }

  @Post('adjust-stock/:productId')
  @Roles('Руководитель', 'Кладовщик')
  async adjustStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() adjustStockDto: AdjustStockDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.stockMovementsService.adjustStock(
      productId,
      adjustStockDto,
      currentUser,
    );
  }

  @Post(':id/cancel')
  @Roles('Руководитель', 'Кладовщик')
  async cancelMovement(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelMovementDto: CancelMovementDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.stockMovementsService.cancelMovement(
      id,
      cancelMovementDto,
      currentUser,
    );
  }

  @Get('product/:productId/history')
  async getProductHistory(@Param('productId', ParseIntPipe) productId: number) {
    return this.stockMovementsService.getProductHistory(productId);
  }
}
