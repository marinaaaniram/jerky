import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceRulesService } from './price-rules.service';
import { PriceRulesController } from './price-rules.controller';
import { PriceRule } from './entities/price-rule.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceRule, Customer, Product])],
  controllers: [PriceRulesController],
  providers: [PriceRulesService],
  exports: [PriceRulesService],
})
export class PriceRulesModule {}
