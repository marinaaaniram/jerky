import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DeliverySurveysService } from './delivery-surveys.service';
import { CreateDeliverySurveyDto } from './dto/create-delivery-survey.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/delivery-surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliverySurveysController {
  constructor(private readonly deliverySurveysService: DeliverySurveysService) {}

  @Post()
  @Roles('Руководитель', 'Курьер')
  async create(@Body() createDeliverySurveyDto: CreateDeliverySurveyDto) {
    return this.deliverySurveysService.create(createDeliverySurveyDto);
  }

  @Get()
  async findAll() {
    return this.deliverySurveysService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliverySurveysService.findOne(id);
  }

  @Get('order/:orderId')
  async findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.deliverySurveysService.findByOrder(orderId);
  }
}
