import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerLocationIdToCustomerUserInvite1755094881361
  implements MigrationInterface
{
  name = 'AddCustomerLocationIdToCustomerUserInvite1755094881361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add customerLocationId column
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD COLUMN "customerLocationId" integer
    `);

    // Create foreign key constraint for customerLocationId
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD CONSTRAINT "FK_customer_user_invite_customer_location" 
      FOREIGN KEY ("customerLocationId") REFERENCES "customer_location"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create index for customerLocationId for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_invite_customer_location_id" ON "customer_user_invite" ("customerLocationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(
      `DROP INDEX "IDX_customer_user_invite_customer_location_id"`,
    );

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" DROP CONSTRAINT "FK_customer_user_invite_customer_location"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" DROP COLUMN "customerLocationId"
    `);
  }
}
