import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceRule } from './entities/price-rule.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from './dto/update-price-rule.dto';

@Injectable()
export class PriceRulesService {
  constructor(
    @InjectRepository(PriceRule)
    private priceRulesRepository: Repository<PriceRule>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createPriceRuleDto: CreatePriceRuleDto): Promise<PriceRule> {
    const customer = await this.customersRepository.findOne({
      where: { id: createPriceRuleDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID ${createPriceRuleDto.customerId} not found`,
      );
    }

    const product = await this.productsRepository.findOne({
      where: { id: createPriceRuleDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createPriceRuleDto.productId} not found`,
      );
    }

    // Check if rule already exists
    const existingRule = await this.priceRulesRepository.findOne({
      where: {
        customerId: createPriceRuleDto.customerId,
        productId: createPriceRuleDto.productId,
      },
    });

    if (existingRule) {
      throw new ConflictException(
        'Price rule for this customer and product already exists',
      );
    }

    const priceRule = this.priceRulesRepository.create(createPriceRuleDto);

    return this.priceRulesRepository.save(priceRule);
  }

  async findAll(customerId?: number): Promise<PriceRule[]> {
    const query = this.priceRulesRepository
      .createQueryBuilder('priceRule')
      .leftJoinAndSelect('priceRule.customer', 'customer')
      .leftJoinAndSelect('priceRule.product', 'product');

    if (customerId) {
      query.where('priceRule.customerId = :customerId', { customerId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<PriceRule> {
    const priceRule = await this.priceRulesRepository.findOne({
      where: { id },
      relations: ['customer', 'product'],
    });

    if (!priceRule) {
      throw new NotFoundException(`Price rule with ID ${id} not found`);
    }

    return priceRule;
  }

  async update(id: number, updatePriceRuleDto: UpdatePriceRuleDto): Promise<PriceRule> {
    const priceRule = await this.findOne(id);

    await this.priceRulesRepository.update(id, updatePriceRuleDto);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const priceRule = await this.findOne(id);
    await this.priceRulesRepository.remove(priceRule);
  }
}
