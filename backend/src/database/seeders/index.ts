import { AppDataSource } from '../data-source';
import { seedRoles } from './roles.seeder';
import { seedUsers } from './users.seeder';
import { seedCustomers } from './customers.seeder';
import { seedProducts } from './products.seeder';
import { seedPriceRules } from './price-rules.seeder';

async function runSeeders() {
  try {
    console.log('🌱 Starting database seeding...\n');

    await AppDataSource.initialize();
    console.log('✅ Data source initialized\n');

    await seedRoles(AppDataSource);
    await seedUsers(AppDataSource);
    await seedCustomers(AppDataSource);
    await seedProducts(AppDataSource);
    await seedPriceRules(AppDataSource);

    console.log('\n🎉 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  }
}

runSeeders();
