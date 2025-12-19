import { PriceRulesService } from './price-rules.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';
import { UpdatePriceRuleDto } from './dto/update-price-rule.dto';
export declare class PriceRulesController {
    private readonly priceRulesService;
    constructor(priceRulesService: PriceRulesService);
    create(createPriceRuleDto: CreatePriceRuleDto): Promise<import("./entities/price-rule.entity").PriceRule>;
    findAll(customerId?: number): Promise<import("./entities/price-rule.entity").PriceRule[]>;
    findOne(id: number): Promise<import("./entities/price-rule.entity").PriceRule>;
    update(id: number, updatePriceRuleDto: UpdatePriceRuleDto): Promise<import("./entities/price-rule.entity").PriceRule>;
    remove(id: number): Promise<void>;
}
