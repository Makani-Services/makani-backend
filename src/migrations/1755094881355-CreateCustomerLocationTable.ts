import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerLocationTable1755094881355
  implements MigrationInterface
{
  name = 'CreateCustomerLocationTable1755094881355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customer_location" (
        "id" SERIAL NOT NULL,
        "name" character varying,
        "address" character varying,
        "phone" character varying,
        "timezone" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "customerId" integer,
        CONSTRAINT "PK_customer_location_id" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key constraint for customer relationship
    await queryRunner.query(`
      ALTER TABLE "customer_location" 
      ADD CONSTRAINT "FK_customer_location_customer" 
      FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_location_customer_id" ON "customer_location" ("customerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_location_name" ON "customer_location" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_location_phone" ON "customer_location" ("phone")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_customer_location_phone"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_location_name"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_location_customer_id"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "customer_location" DROP CONSTRAINT "FK_customer_location_customer"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "customer_location"`);
  }
}
