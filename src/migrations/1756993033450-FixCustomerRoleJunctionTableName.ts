import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCustomerRoleJunctionTableName1756993033450
  implements MigrationInterface
{
  name = 'FixCustomerRoleJunctionTableName1756993033450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old junction table if it exists
    await queryRunner.query(`
      DROP TABLE IF EXISTS "customer_user_customer_roles_customer_role"
    `);

    // Create the correct junction table with the name TypeORM expects
    await queryRunner.query(`
      CREATE TABLE "customer_role_customer_users_customer_user" (
        "customerRoleId" integer NOT NULL,
        "customerUserId" integer NOT NULL,
        CONSTRAINT "PK_customer_role_customer_users_customer_user" PRIMARY KEY ("customerRoleId", "customerUserId")
      )
    `);

    // Create foreign key constraints for the new junction table
    await queryRunner.query(`
      ALTER TABLE "customer_role_customer_users_customer_user" 
      ADD CONSTRAINT "FK_customer_role_customer_users_customer_user_customer_role" 
      FOREIGN KEY ("customerRoleId") REFERENCES "customer_role"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "customer_role_customer_users_customer_user" 
      ADD CONSTRAINT "FK_customer_role_customer_users_customer_user_customer_user" 
      FOREIGN KEY ("customerUserId") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_role_customer_users_customer_user_customer_role_id" 
      ON "customer_role_customer_users_customer_user" ("customerRoleId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_role_customer_users_customer_user_customer_user_id" 
      ON "customer_role_customer_users_customer_user" ("customerUserId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_customer_role_customer_users_customer_user_customer_user_id"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_customer_role_customer_users_customer_user_customer_role_id"
    `);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "customer_role_customer_users_customer_user" 
      DROP CONSTRAINT IF EXISTS "FK_customer_role_customer_users_customer_user_customer_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "customer_role_customer_users_customer_user" 
      DROP CONSTRAINT IF EXISTS "FK_customer_role_customer_users_customer_user_customer_role"
    `);

    // Drop the new junction table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "customer_role_customer_users_customer_user"
    `);

    // Recreate the old junction table (if needed for rollback)
    await queryRunner.query(`
      CREATE TABLE "customer_user_customer_roles_customer_role" (
        "customerUserId" integer NOT NULL,
        "customerRoleId" integer NOT NULL,
        CONSTRAINT "PK_customer_user_customer_roles_customer_role" PRIMARY KEY ("customerUserId", "customerRoleId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "customer_user_customer_roles_customer_role" 
      ADD CONSTRAINT "FK_customer_user_customer_roles_customer_role_customer_user" 
      FOREIGN KEY ("customerUserId") REFERENCES "customer_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "customer_user_customer_roles_customer_role" 
      ADD CONSTRAINT "FK_customer_user_customer_roles_customer_role_customer_role" 
      FOREIGN KEY ("customerRoleId") REFERENCES "customer_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_customer_roles_customer_role_customer_user_id" 
      ON "customer_user_customer_roles_customer_role" ("customerUserId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_customer_roles_customer_role_customer_role_id" 
      ON "customer_user_customer_roles_customer_role" ("customerRoleId")
    `);
  }
}
