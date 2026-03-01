import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTicketCustomerRelationsToCustomerUser1769500000007
  implements MigrationInterface
{
  name = 'ChangeTicketCustomerRelationsToCustomerUser1769500000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_created_by_customer"
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_requester_customer"
    `);

    await queryRunner.query(`
      UPDATE "ticket" t
      SET "createdByCustomerId" = NULL
      WHERE "createdByCustomerId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "customer_user" cu
          WHERE cu."id" = t."createdByCustomerId"
        )
    `);

    await queryRunner.query(`
      UPDATE "ticket" t
      SET "requesterCustomerId" = NULL
      WHERE "requesterCustomerId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "customer_user" cu
          WHERE cu."id" = t."requesterCustomerId"
        )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_created_by_customer"
      FOREIGN KEY ("createdByCustomerId") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_requester_customer"
      FOREIGN KEY ("requesterCustomerId") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_requester_customer"
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_created_by_customer"
    `);

    await queryRunner.query(`
      UPDATE "ticket" t
      SET "createdByCustomerId" = NULL
      WHERE "createdByCustomerId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "customer" c
          WHERE c."id" = t."createdByCustomerId"
        )
    `);

    await queryRunner.query(`
      UPDATE "ticket" t
      SET "requesterCustomerId" = NULL
      WHERE "requesterCustomerId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM "customer" c
          WHERE c."id" = t."requesterCustomerId"
        )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_created_by_customer"
      FOREIGN KEY ("createdByCustomerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_requester_customer"
      FOREIGN KEY ("requesterCustomerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
