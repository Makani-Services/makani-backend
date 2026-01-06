import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerUserCustomerLocationJunctionTable1756993033451
  implements MigrationInterface
{
  name = 'CreateCustomerUserCustomerLocationJunctionTable1756993033451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the junction table for the many-to-many relationship
    // between CustomerUser and CustomerLocation
    await queryRunner.query(`
      CREATE TABLE "customer_location_customer_users_customer_user" (
        "customerLocationId" integer NOT NULL,
        "customerUserId" integer NOT NULL,
        CONSTRAINT "PK_customer_location_customer_users_customer_user" PRIMARY KEY ("customerLocationId", "customerUserId")
      )
    `);

    // Create foreign key constraints for the junction table
    await queryRunner.query(`
      ALTER TABLE "customer_location_customer_users_customer_user" 
      ADD CONSTRAINT "FK_customer_location_customer_users_customer_user_customer_location" 
      FOREIGN KEY ("customerLocationId") REFERENCES "customer_location"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "customer_location_customer_users_customer_user" 
      ADD CONSTRAINT "FK_customer_location_customer_users_customer_user_customer_user" 
      FOREIGN KEY ("customerUserId") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_location_customer_users_customer_user_customer_location_id" 
      ON "customer_location_customer_users_customer_user" ("customerLocationId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_location_customer_users_customer_user_customer_user_id" 
      ON "customer_location_customer_users_customer_user" ("customerUserId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_customer_location_customer_users_customer_user_customer_user_id"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_customer_location_customer_users_customer_user_customer_location_id"
    `);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "customer_location_customer_users_customer_user" 
      DROP CONSTRAINT IF EXISTS "FK_customer_location_customer_users_customer_user_customer_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "customer_location_customer_users_customer_user" 
      DROP CONSTRAINT IF EXISTS "FK_customer_location_customer_users_customer_user_customer_location"
    `);

    // Drop the junction table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "customer_location_customer_users_customer_user"
    `);
  }
}
