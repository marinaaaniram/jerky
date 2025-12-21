"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInventoryFields1702000000001 = void 0;
class AddInventoryFields1702000000001 {
    name = 'AddInventoryFields1702000000001';
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TYPE "stock_movements_reason_enum" ADD VALUE 'инвентаризация'
        `);
        await queryRunner.query(`
            ALTER TYPE "stock_movements_reason_enum" ADD VALUE 'коррекция'
        `);
        await queryRunner.query(`
            ALTER TYPE "stock_movements_reason_enum" ADD VALUE 'уточнение'
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            ADD COLUMN "user_id" INTEGER
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            ADD COLUMN "cancelled_by" INTEGER
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            ADD COLUMN "reason_text" VARCHAR(255)
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            ADD COLUMN "is_active" BOOLEAN DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            ADD CONSTRAINT "FK_stock_movements_user_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            ADD CONSTRAINT "FK_stock_movements_cancelled_by"
            FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE SET NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_stock_movements_user_id" ON "stock_movements"("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_stock_movements_is_active" ON "stock_movements"("is_active")
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_stock_movements_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_stock_movements_user_id"`);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            DROP CONSTRAINT "FK_stock_movements_cancelled_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            DROP CONSTRAINT "FK_stock_movements_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            DROP COLUMN "is_active"
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            DROP COLUMN "reason_text"
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            DROP COLUMN "cancelled_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "stock_movements"
            DROP COLUMN "user_id"
        `);
    }
}
exports.AddInventoryFields1702000000001 = AddInventoryFields1702000000001;
//# sourceMappingURL=1702000000001-AddInventoryFields.js.map