import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerRoleIdToCustomerUserInvite1755094881363
  implements MigrationInterface
{
  name = 'AddCustomerRoleIdToCustomerUserInvite1755094881363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add customerRoleId column
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD COLUMN "customerRoleId" integer
    `);

    // Create foreign key constraint for customerRoleId
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD CONSTRAINT "FK_customer_user_invite_customer_role" 
      FOREIGN KEY ("customerRoleId") REFERENCES "customer_role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create index for customerRoleId for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_invite_customer_role_id" ON "customer_user_invite" ("customerRoleId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(
      `DROP INDEX "IDX_customer_user_invite_customer_role_id"`,
    );

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "customer_user_invite" DROP CONSTRAINT "FK_customer_user_invite_customer_role"`,
    );

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" DROP COLUMN "customerRoleId"
    `);
  }
}
