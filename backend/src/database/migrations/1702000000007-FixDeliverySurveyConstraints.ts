import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDeliverySurveyConstraints1702000000007 implements MigrationInterface {
  name = 'FixDeliverySurveyConstraints1702000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, fill any NULL values in photo_url with empty string
    await queryRunner.query(`
      UPDATE "delivery_surveys"
      SET "photo_url" = ''
      WHERE "photo_url" IS NULL
    `);

    // Make photo_url required (NOT NULL)
    await queryRunner.query(`
      ALTER TABLE "delivery_surveys"
      ALTER COLUMN "photo_url" SET NOT NULL
    `);

    // Make sure other_notes is nullable
    await queryRunner.query(`
      ALTER TABLE "delivery_surveys"
      ALTER COLUMN "other_notes" DROP NOT NULL
    `);

    // Add default value for timestamp
    await queryRunner.query(`
      ALTER TABLE "delivery_surveys"
      ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "delivery_surveys"
      ALTER COLUMN "photo_url" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "delivery_surveys"
      ALTER COLUMN "other_notes" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "delivery_surveys"
      ALTER COLUMN "timestamp" DROP DEFAULT
    `);
  }
}
