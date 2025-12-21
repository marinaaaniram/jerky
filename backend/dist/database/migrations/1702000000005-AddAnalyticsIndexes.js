"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAnalyticsIndexes1702000000005 = void 0;
class AddAnalyticsIndexes1702000000005 {
    name = 'AddAnalyticsIndexes1702000000005';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_status_date" ON "orders"("status", "orderDate")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_item_product_date" ON "order_items"("productId", "createdAt")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_stock_movement_date_reason" ON "stock_movements"("movementDate", "reason", "isActive")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_customer_payment_type_debt" ON "customers"("paymentType", "debt")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_payment_payment_date" ON "payments"("paymentDate")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_order_customer_date" ON "orders"("customerId", "orderDate")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_customer_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_payment_payment_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_customer_payment_type_debt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_stock_movement_date_reason"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_item_product_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_status_date"`);
    }
}
exports.AddAnalyticsIndexes1702000000005 = AddAnalyticsIndexes1702000000005;
//# sourceMappingURL=1702000000005-AddAnalyticsIndexes.js.map