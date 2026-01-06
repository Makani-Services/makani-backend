import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerNotificationTable1759115504821
  implements MigrationInterface
{
  name = 'CreateCustomerNotificationTable1759115504821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customer_notification" (
        "id" SERIAL NOT NULL,
        "status" integer,
        "type" integer NOT NULL,
        "recipientList" character varying,
        "company" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "customerLocationId" integer,
        CONSTRAINT "PK_customer_notification_id" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key constraint to customer_location table
    await queryRunner.query(`
      ALTER TABLE "customer_notification" 
      ADD CONSTRAINT "FK_customer_notification_customer_location" 
      FOREIGN KEY ("customerLocationId") REFERENCES "customer_location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_notification_company" ON "customer_notification" ("company")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_notification_customer_location_id" ON "customer_notification" ("customerLocationId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_notification_status" ON "customer_notification" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_notification_type" ON "customer_notification" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_notification_created_at" ON "customer_notification" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_customer_notification_created_at"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_customer_notification_type"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_notification_status"`);
    await queryRunner.query(
      `DROP INDEX "IDX_customer_notification_customer_location_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_customer_notification_company"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "customer_notification" DROP CONSTRAINT "FK_customer_notification_customer_location"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE "customer_notification"`);
  }
}
