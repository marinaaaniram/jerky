import { Repository } from 'typeorm';
import { DeliverySurvey } from './entities/delivery-survey.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateDeliverySurveyDto } from './dto/create-delivery-survey.dto';
export declare class DeliverySurveysService {
    private deliverySurveysRepository;
    private ordersRepository;
    constructor(deliverySurveysRepository: Repository<DeliverySurvey>, ordersRepository: Repository<Order>);
    create(createDeliverySurveyDto: CreateDeliverySurveyDto): Promise<DeliverySurvey>;
    findAll(): Promise<DeliverySurvey[]>;
    findOne(id: number): Promise<DeliverySurvey>;
    findByOrder(orderId: number): Promise<DeliverySurvey | null>;
}
