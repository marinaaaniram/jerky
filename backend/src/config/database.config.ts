import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'jerky_user',
  password: process.env.DATABASE_PASSWORD || 'jerky_password',
  database: process.env.DATABASE_NAME || 'jerky',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Автосоздание таблиц в dev режиме
  logging: process.env.NODE_ENV === 'development',
};
