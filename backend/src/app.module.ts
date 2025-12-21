import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { DatabaseInitService } from './database/database-init.service';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { PriceRulesModule } from './price-rules/price-rules.module';
import { DeliverySurveysModule } from './delivery-surveys/delivery-surveys.module';
import { SearchModule } from './search/search.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    RolesModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    StockMovementsModule,
    PriceRulesModule,
    DeliverySurveysModule,
    SearchModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseInitService],
})
export class AppModule {}
