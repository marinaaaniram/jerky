import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToOrder1702000000004 implements MigrationInterface {
    name = 'AddUserIdToOrder1702000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "user_id" integer
        `);

        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_orders_user_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "orders"
            DROP CONSTRAINT "FK_orders_user_id"
        `);

        await queryRunner.query(`
            ALTER TABLE "orders"
            DROP COLUMN "user_id"
        `);
    }
}
