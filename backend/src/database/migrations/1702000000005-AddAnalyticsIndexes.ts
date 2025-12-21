import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsIndexes1702000000005 implements MigrationInterface {
  name = 'AddAnalyticsIndexes1702000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index for order status and date queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_status_date" ON "orders"("status", "orderDate")`,
    );

    // Index for order items product date queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_item_product_date" ON "order_items"("productId", "createdAt")`,
    );

    // Index for stock movements date and reason queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_stock_movement_date_reason" ON "stock_movements"("movementDate", "reason", "isActive")`,
    );

    // Index for customer payment type and debt queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_customer_payment_type_debt" ON "customers"("paymentType", "debt")`,
    );

    // Index for payment date queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_payment_payment_date" ON "payments"("paymentDate")`,
    );

    // Index for order customer date queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_customer_date" ON "orders"("customerId", "orderDate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_order_customer_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_payment_payment_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_customer_payment_type_debt"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_stock_movement_date_reason"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_order_item_product_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_order_status_date"`,
    );
  }
}
