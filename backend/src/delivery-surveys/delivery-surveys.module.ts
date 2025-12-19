import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySurveysService } from './delivery-surveys.service';
import { DeliverySurveysController } from './delivery-surveys.controller';
import { DeliverySurvey } from './entities/delivery-survey.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverySurvey, Order])],
  controllers: [DeliverySurveysController],
  providers: [DeliverySurveysService],
  exports: [DeliverySurveysService],
})
export class DeliverySurveysModule {}
