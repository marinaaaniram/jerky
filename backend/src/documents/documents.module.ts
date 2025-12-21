import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { DocumentGeneratorService } from './document-generator.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [DocumentGeneratorService],
  controllers: [DocumentController],
  exports: [DocumentGeneratorService],
})
export class DocumentsModule {}
