import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerLocationToWo1755094881358
  implements MigrationInterface
{
  name = 'AddCustomerLocationToWo1755094881358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add customerLocationId column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ADD COLUMN "customerLocationId" integer
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ADD CONSTRAINT "FK_wo_customer_location" 
      FOREIGN KEY ("customerLocationId") 
      REFERENCES "customer_location"("id") 
      ON DELETE SET NULL
    `);

    // Create index for better performance on customerLocationId
    await queryRunner.query(`
      CREATE INDEX "IDX_wo_customer_location_id" ON "wo" ("customerLocationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_wo_customer_location_id"`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "wo" DROP CONSTRAINT "FK_wo_customer_location"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "wo" DROP COLUMN "customerLocationId"
    `);
  }
}
