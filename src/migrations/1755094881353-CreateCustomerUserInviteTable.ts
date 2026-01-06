import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerUserInviteTable1755094881353
  implements MigrationInterface
{
  name = 'CreateCustomerUserInviteTable1755094881353';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customer_user_invite" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "token" character varying NOT NULL,
        "accepted" boolean NOT NULL DEFAULT false,
        "name" character varying,
        "phone" character varying,
        "company" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "customerId" integer,
        "invitedById" integer,
        "invitedByAdminId" integer,
        CONSTRAINT "PK_customer_user_invite_id" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD CONSTRAINT "FK_customer_user_invite_customer" 
      FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD CONSTRAINT "FK_customer_user_invite_invited_by" 
      FOREIGN KEY ("invitedById") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "customer_user_invite" 
      ADD CONSTRAINT "FK_customer_user_invite_invited_by_admin" 
      FOREIGN KEY ("invitedByAdminId") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_invite_email" ON "customer_user_invite" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_invite_token" ON "customer_user_invite" ("token")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_invite_customer_id" ON "customer_user_invite" ("customerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_user_invite_accepted" ON "customer_user_invite" ("accepted")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_customer_user_invite_accepted"`);
    await queryRunner.query(
      `DROP INDEX "IDX_customer_user_invite_customer_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_customer_user_invite_token"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_user_invite_email"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "customer_user_invite" DROP CONSTRAINT "FK_customer_user_invite_invited_by_admin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_user_invite" DROP CONSTRAINT "FK_customer_user_invite_invited_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_user_invite" DROP CONSTRAINT "FK_customer_user_invite_customer"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "customer_user_invite"`);
  }
}
