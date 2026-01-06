import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerLocationIdToCustomerUser1755094881362
  implements MigrationInterface
{
  name = 'AddCustomerLocationIdToCustomerUser1755094881362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add customerLocationId column
    await queryRunner.query(`
      ALTER TABLE "customer_user" 
      ADD COLUMN "customerLocationId" integer
    `);

    // Create foreign key constraint for customerLocationId
    await queryRunner.query(`
      ALTER TABLE "customer_user" 
      ADD CONSTRAINT "FK_customer_user_customer_location" 
      FOREIGN KEY ("customerLocationId") REFERENCES "customer_location"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create index for customerLocationId for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_customer_location_id" ON "customer_user" ("customerLocationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(
      `DROP INDEX "IDX_customer_user_customer_location_id"`,
    );

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "customer_user" DROP CONSTRAINT "FK_customer_user_customer_location"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "customer_user" DROP COLUMN "customerLocationId"
    `);
  }
}
