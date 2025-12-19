import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PriceRulesService } from './price-rules.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from './dto/update-price-rule.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/price-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PriceRulesController {
  constructor(private readonly priceRulesService: PriceRulesService) {}

  @Post()
  @Roles('Руководитель', 'Менеджер по продажам')
  async create(@Body() createPriceRuleDto: CreatePriceRuleDto) {
    return this.priceRulesService.create(createPriceRuleDto);
  }

  @Get()
  async findAll(@Query('customerId', new ParseIntPipe({ optional: true })) customerId?: number) {
    return this.priceRulesService.findAll(customerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceRulesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Руководитель', 'Менеджер по продажам')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePriceRuleDto: UpdatePriceRuleDto,
  ) {
    return this.priceRulesService.update(id, updatePriceRuleDto);
  }

  @Delete(':id')
  @Roles('Руководитель', 'Менеджер по продажам')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceRulesService.remove(id);
  }
}
