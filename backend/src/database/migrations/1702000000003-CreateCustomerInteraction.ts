import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerInteraction1702000000003 implements MigrationInterface {
    name = 'CreateCustomerInteraction1702000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for interaction types
        await queryRunner.query(`
            CREATE TYPE "customer_interaction_type_enum" AS ENUM(
                'ORDER_CREATED',
                'ORDER_DELIVERED',
                'PAYMENT_RECEIVED',
                'CUSTOMER_DATA_UPDATED',
                'ARCHIVED',
                'UNARCHIVED'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "customer_interaction" (
                "id" SERIAL NOT NULL,
                "customerId" integer NOT NULL,
                "userId" integer,
                "type" "customer_interaction_type_enum" NOT NULL,
                "description" text NOT NULL,
                "metadata" json,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_customer_interaction" PRIMARY KEY ("id"),
                CONSTRAINT "FK_customer_interaction_customerId" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_customer_interaction_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_customer_interaction_customer_type_created"
            ON "customer_interaction"("customerId", "type", "createdAt")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_customer_interaction_customer_created"
            ON "customer_interaction"("customerId", "createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_customer_interaction_customer_created"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_customer_interaction_customer_type_created"
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "customer_interaction"
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "customer_interaction_type_enum"
        `);
    }
}
