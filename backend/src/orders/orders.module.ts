import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { PriceRule } from '../price-rules/entities/price-rule.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { DeliverySurvey } from '../delivery-surveys/entities/delivery-survey.entity';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Customer,
      Product,
      PriceRule,
      StockMovement,
      DeliverySurvey,
    ]),
    CustomersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
