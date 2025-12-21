"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'jerky_user',
    password: process.env.DATABASE_PASSWORD || 'jerky_password',
    database: process.env.DATABASE_NAME || 'jerky',
    entities: ['src/**/entities/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=data-source.js.map