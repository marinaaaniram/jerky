import { Repository } from 'typeorm';
import { PriceRule } from './entities/price-rule.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../products/entities/product.entity';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from './dto/update-price-rule.dto';
export declare class PriceRulesService {
    private priceRulesRepository;
    private customersRepository;
    private productsRepository;
    constructor(priceRulesRepository: Repository<PriceRule>, customersRepository: Repository<Customer>, productsRepository: Repository<Product>);
    create(createPriceRuleDto: CreatePriceRuleDto): Promise<PriceRule>;
    findAll(customerId?: number): Promise<PriceRule[]>;
    findOne(id: number): Promise<PriceRule>;
    update(id: number, updatePriceRuleDto: UpdatePriceRuleDto): Promise<PriceRule>;
    remove(id: number): Promise<void>;
}
