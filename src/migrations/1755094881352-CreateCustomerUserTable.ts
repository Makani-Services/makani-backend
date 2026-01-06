import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerUserTable1755094881352
  implements MigrationInterface
{
  name = 'CreateCustomerUserTable1755094881352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customer_user" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying,
        "isEnabled" boolean NOT NULL DEFAULT true,
        "company" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "customerId" integer,
        CONSTRAINT "PK_customer_user_id" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint on email
    await queryRunner.query(`
      ALTER TABLE "customer_user" 
      ADD CONSTRAINT "UQ_customer_user_email" UNIQUE ("email")
    `);

    // Create foreign key constraint to customer table
    await queryRunner.query(`
      ALTER TABLE "customer_user" 
      ADD CONSTRAINT "FK_customer_user_customer" 
      FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_email" ON "customer_user" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_customer_id" ON "customer_user" ("customerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_is_enabled" ON "customer_user" ("isEnabled")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_customer_user_is_enabled"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_user_customer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_user_email"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "customer_user" DROP CONSTRAINT "FK_customer_user_customer"`,
    );

    // Drop unique constraint
    await queryRunner.query(
      `ALTER TABLE "customer_user" DROP CONSTRAINT "UQ_customer_user_email"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "customer_user"`);
  }
}
