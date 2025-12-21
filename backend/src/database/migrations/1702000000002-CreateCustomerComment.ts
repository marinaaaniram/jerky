import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerComment1702000000002 implements MigrationInterface {
    name = 'CreateCustomerComment1702000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "customer_comment" (
                "id" SERIAL NOT NULL,
                "customerId" integer NOT NULL,
                "userId" integer NOT NULL,
                "content" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_customer_comment" PRIMARY KEY ("id"),
                CONSTRAINT "FK_customer_comment_customerId" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_customer_comment_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_customer_comment_customer_id_created_at"
            ON "customer_comment"("customerId", "createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_customer_comment_customer_id_created_at"
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS "customer_comment"
        `);
    }
}
