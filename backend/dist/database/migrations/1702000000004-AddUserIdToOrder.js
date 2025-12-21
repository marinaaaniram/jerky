"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserIdToOrder1702000000004 = void 0;
class AddUserIdToOrder1702000000004 {
    name = 'AddUserIdToOrder1702000000004';
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.AddUserIdToOrder1702000000004 = AddUserIdToOrder1702000000004;
//# sourceMappingURL=1702000000004-AddUserIdToOrder.js.map