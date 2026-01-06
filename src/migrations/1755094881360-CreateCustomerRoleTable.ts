import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerRoleTable1755094881360
  implements MigrationInterface
{
  name = 'CreateCustomerRoleTable1755094881360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create customer_role table
    await queryRunner.query(`
      CREATE TABLE "customer_role" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_role_id" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint on name
    await queryRunner.query(`
      ALTER TABLE "customer_role" 
      ADD CONSTRAINT "UQ_customer_role_name" UNIQUE ("name")
    `);

    // Create junction table for many-to-many relationship with customer_user
    await queryRunner.query(`
      CREATE TABLE "customer_user_customer_roles_customer_role" (
        "customerUserId" integer NOT NULL,
        "customerRoleId" integer NOT NULL,
        CONSTRAINT "PK_customer_user_customer_roles_customer_role" PRIMARY KEY ("customerUserId", "customerRoleId")
      )
    `);

    // Create foreign key constraints for junction table
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

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_role_name" ON "customer_role" ("name")
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_customer_user_customer_roles_customer_role_customer_role_id"
    `);
    await queryRunner.query(`
      DROP INDEX "IDX_customer_user_customer_roles_customer_role_customer_user_id"
    `);
    await queryRunner.query(`
      DROP INDEX "IDX_customer_role_name"
    `);

    // Drop foreign key constraints for junction table
    await queryRunner.query(`
      ALTER TABLE "customer_user_customer_roles_customer_role" 
      DROP CONSTRAINT "FK_customer_user_customer_roles_customer_role_customer_role"
    `);
    await queryRunner.query(`
      ALTER TABLE "customer_user_customer_roles_customer_role" 
      DROP CONSTRAINT "FK_customer_user_customer_roles_customer_role_customer_user"
    `);

    // Drop junction table
    await queryRunner.query(`
      DROP TABLE "customer_user_customer_roles_customer_role"
    `);

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE "customer_role" DROP CONSTRAINT "UQ_customer_role_name"
    `);

    // Drop customer_role table
    await queryRunner.query(`
      DROP TABLE "customer_role"
    `);
  }
}
