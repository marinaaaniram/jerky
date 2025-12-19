import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1702000000000 implements MigrationInterface {
    name = 'InitialSchema1702000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(50) UNIQUE NOT NULL,
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL PRIMARY KEY,
                "first_name" VARCHAR(100) NOT NULL,
                "last_name" VARCHAR(100) NOT NULL,
                "email" VARCHAR(100) UNIQUE NOT NULL,
                "password" VARCHAR(255),
                "role_id" INTEGER NOT NULL,
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("role_id") REFERENCES "roles"("id")
            )
        `);

        // Create customers table
        await queryRunner.query(`
            CREATE TYPE "payment_type_enum" AS ENUM ('прямые', 'реализация');
            CREATE TABLE "customers" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(200) NOT NULL,
                "address" TEXT,
                "phone" VARCHAR(20),
                "payment_type" payment_type_enum DEFAULT 'прямые',
                "debt" DECIMAL(10, 2) DEFAULT 0,
                "is_archived" BOOLEAN DEFAULT FALSE,
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW()
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_customers_name" ON "customers"("name")`);
        await queryRunner.query(`CREATE INDEX "idx_customers_archived" ON "customers"("is_archived")`);

        // Create products table
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(200) NOT NULL,
                "price" DECIMAL(10, 2) NOT NULL,
                "stock_quantity" INTEGER DEFAULT 0,
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW()
            )
        `);

        // Create orders table
        await queryRunner.query(`
            CREATE TYPE "order_status_enum" AS ENUM ('Новый', 'В сборке', 'Передан курьеру', 'Доставлен');
            CREATE TABLE "orders" (
                "id" SERIAL PRIMARY KEY,
                "customer_id" INTEGER NOT NULL,
                "order_date" DATE NOT NULL,
                "status" order_status_enum DEFAULT 'Новый',
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("status")`);
        await queryRunner.query(`CREATE INDEX "idx_orders_date" ON "orders"("order_date")`);

        // Create order_items table
        await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" SERIAL PRIMARY KEY,
                "order_id" INTEGER NOT NULL,
                "product_id" INTEGER NOT NULL,
                "quantity" INTEGER NOT NULL,
                "price" DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
                FOREIGN KEY ("product_id") REFERENCES "products"("id")
            )
        `);

        // Create payments table
        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" SERIAL PRIMARY KEY,
                "customer_id" INTEGER NOT NULL,
                "amount" DECIMAL(10, 2) NOT NULL,
                "payment_date" DATE NOT NULL,
                "created_at" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_payments_date" ON "payments"("payment_date")`);

        // Create stock_movements table
        await queryRunner.query(`
            CREATE TYPE "movement_reason_enum" AS ENUM ('приход', 'продажа', 'списание');
            CREATE TABLE "stock_movements" (
                "id" SERIAL PRIMARY KEY,
                "product_id" INTEGER NOT NULL,
                "quantity_change" INTEGER NOT NULL,
                "reason" movement_reason_enum NOT NULL,
                "movement_date" DATE NOT NULL,
                "created_at" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("product_id") REFERENCES "products"("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_movements_date" ON "stock_movements"("movement_date")`);

        // Create price_rules table
        await queryRunner.query(`
            CREATE TABLE "price_rules" (
                "id" SERIAL PRIMARY KEY,
                "customer_id" INTEGER NOT NULL,
                "product_id" INTEGER NOT NULL,
                "special_price" DECIMAL(10, 2) NOT NULL,
                "created_at" TIMESTAMP DEFAULT NOW(),
                "updated_at" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("customer_id") REFERENCES "customers"("id"),
                FOREIGN KEY ("product_id") REFERENCES "products"("id"),
                UNIQUE ("customer_id", "product_id")
            )
        `);

        // Create delivery_surveys table
        await queryRunner.query(`
            CREATE TABLE "delivery_surveys" (
                "id" SERIAL PRIMARY KEY,
                "order_id" INTEGER UNIQUE NOT NULL,
                "photo_url" TEXT,
                "stock_check_notes" TEXT NOT NULL,
                "layout_notes" TEXT NOT NULL,
                "other_notes" TEXT,
                "timestamp" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("order_id") REFERENCES "orders"("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "delivery_surveys"`);
        await queryRunner.query(`DROP TABLE "price_rules"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP TYPE "movement_reason_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "order_status_enum"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TYPE "payment_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }
}
