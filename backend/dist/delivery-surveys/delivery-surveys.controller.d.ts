import { DeliverySurveysService } from './delivery-surveys.service';
import { CreateDeliverySurveyDto } from './dto/create-delivery-survey.dto';
export declare class DeliverySurveysController {
    private readonly deliverySurveysService;
    constructor(deliverySurveysService: DeliverySurveysService);
    create(createDeliverySurveyDto: CreateDeliverySurveyDto): Promise<import("./entities/delivery-survey.entity").DeliverySurvey>;
    findAll(): Promise<import("./entities/delivery-survey.entity").DeliverySurvey[]>;
    findOne(id: number): Promise<import("./entities/delivery-survey.entity").DeliverySurvey>;
    findByOrder(orderId: number): Promise<import("./entities/delivery-survey.entity").DeliverySurvey | null>;
}
