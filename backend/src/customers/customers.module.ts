import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from './entities/customer.entity';
import { CustomerComment } from './entities/customer-comment.entity';
import { CustomerInteraction } from './entities/customer-interaction.entity';
import { CustomerCommentService } from './services/customer-comment.service';
import { CustomerInteractionService } from './services/customer-interaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerComment, CustomerInteraction]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerCommentService, CustomerInteractionService],
  exports: [CustomersService, CustomerCommentService, CustomerInteractionService],
})
export class CustomersModule {}
