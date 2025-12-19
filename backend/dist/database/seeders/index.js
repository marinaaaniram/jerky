"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const roles_seeder_1 = require("./roles.seeder");
const users_seeder_1 = require("./users.seeder");
const customers_seeder_1 = require("./customers.seeder");
const products_seeder_1 = require("./products.seeder");
const price_rules_seeder_1 = require("./price-rules.seeder");
async function runSeeders() {
    try {
        console.log('🌱 Starting database seeding...\n');
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Data source initialized\n');
        await (0, roles_seeder_1.seedRoles)(data_source_1.AppDataSource);
        await (0, users_seeder_1.seedUsers)(data_source_1.AppDataSource);
        await (0, customers_seeder_1.seedCustomers)(data_source_1.AppDataSource);
        await (0, products_seeder_1.seedProducts)(data_source_1.AppDataSource);
        await (0, price_rules_seeder_1.seedPriceRules)(data_source_1.AppDataSource);
        console.log('\n🎉 All seeders completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error running seeders:', error);
        process.exit(1);
    }
}
runSeeders();
//# sourceMappingURL=index.js.map