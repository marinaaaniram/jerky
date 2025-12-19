import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliverySurvey } from './entities/delivery-survey.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateDeliverySurveyDto } from './dto/create-delivery-survey.dto';

@Injectable()
export class DeliverySurveysService {
  constructor(
    @InjectRepository(DeliverySurvey)
    private deliverySurveysRepository: Repository<DeliverySurvey>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createDeliverySurveyDto: CreateDeliverySurveyDto): Promise<DeliverySurvey> {
    const order = await this.ordersRepository.findOne({
      where: { id: createDeliverySurveyDto.orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${createDeliverySurveyDto.orderId} not found`,
      );
    }

    // Check if survey already exists for this order
    const existingSurvey = await this.deliverySurveysRepository.findOne({
      where: { orderId: createDeliverySurveyDto.orderId },
    });

    if (existingSurvey) {
      throw new ConflictException('Delivery survey for this order already exists');
    }

    const survey = this.deliverySurveysRepository.create(createDeliverySurveyDto);

    return this.deliverySurveysRepository.save(survey);
  }

  async findAll(): Promise<DeliverySurvey[]> {
    return this.deliverySurveysRepository.find({
      relations: ['order', 'order.customer'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<DeliverySurvey> {
    const survey = await this.deliverySurveysRepository.findOne({
      where: { id },
      relations: ['order', 'order.customer'],
    });

    if (!survey) {
      throw new NotFoundException(`Delivery survey with ID ${id} not found`);
    }

    return survey;
  }

  async findByOrder(orderId: number): Promise<DeliverySurvey | null> {
    return this.deliverySurveysRepository.findOne({
      where: { orderId },
      relations: ['order'],
    });
  }
}
