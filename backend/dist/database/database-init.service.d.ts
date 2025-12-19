import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseInitService implements OnModuleInit {
    private dataSource;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private seedDatabase;
    private seedRoles;
    private seedUsers;
    private seedCustomers;
    private seedProducts;
    private seedPriceRules;
}
