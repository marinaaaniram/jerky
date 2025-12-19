import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    findAll(includeArchived?: boolean): Promise<import("./entities/customer.entity").Customer[]>;
    findOne(id: number): Promise<import("./entities/customer.entity").Customer>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<import("./entities/customer.entity").Customer>;
    archive(id: number): Promise<import("./entities/customer.entity").Customer>;
}
