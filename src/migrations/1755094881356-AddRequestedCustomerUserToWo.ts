import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestedCustomerUserToWo1755094881356
  implements MigrationInterface
{
  name = 'AddRequestedCustomerUserToWo1755094881356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add requestedCustomerUserId column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ADD COLUMN "requestedCustomerUserId" integer
    `);

    // Create foreign key constraint to customer_user table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ADD CONSTRAINT "FK_wo_requested_customer_user" 
      FOREIGN KEY ("requestedCustomerUserId") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create index for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_wo_requested_customer_user_id" ON "wo" ("requestedCustomerUserId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_wo_requested_customer_user_id"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "wo" DROP CONSTRAINT "FK_wo_requested_customer_user"`,
    );

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "wo" DROP COLUMN "requestedCustomerUserId"
    `);
  }
}
