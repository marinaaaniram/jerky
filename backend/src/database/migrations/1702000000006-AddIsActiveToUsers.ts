import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToUsers1702000000006 implements MigrationInterface {
  name = 'AddIsActiveToUsers1702000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "is_active" BOOLEAN DEFAULT true
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users"("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_users_is_active"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "is_active"
    `);
  }
}

