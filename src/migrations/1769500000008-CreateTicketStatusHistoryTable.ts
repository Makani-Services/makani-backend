import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketStatusHistoryTable1769500000008
  implements MigrationInterface
{
  name = 'CreateTicketStatusHistoryTable1769500000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_status_history" (
        "id" SERIAL NOT NULL,
        "ticketId" integer NOT NULL,
        "fromStatus" smallint NOT NULL,
        "toStatus" smallint NOT NULL,
        "changedByUserId" integer,
        "changedByCustomerUserId" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_status_history_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_status_history"
      ADD CONSTRAINT "FK_ticket_status_history_ticket"
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_status_history"
      ADD CONSTRAINT "FK_ticket_status_history_changed_by_user"
      FOREIGN KEY ("changedByUserId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_status_history"
      ADD CONSTRAINT "FK_ticket_status_history_changed_by_customer_user"
      FOREIGN KEY ("changedByCustomerUserId") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_status_history_ticket_id" ON "ticket_status_history" ("ticketId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_status_history_changed_by_user_id" ON "ticket_status_history" ("changedByUserId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_status_history_changed_by_customer_user_id" ON "ticket_status_history" ("changedByCustomerUserId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_ticket_status_history_changed_by_customer_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_ticket_status_history_changed_by_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ticket_status_history_ticket_id"`);

    await queryRunner.query(
      `ALTER TABLE "ticket_status_history" DROP CONSTRAINT "FK_ticket_status_history_changed_by_customer_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_status_history" DROP CONSTRAINT "FK_ticket_status_history_changed_by_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_status_history" DROP CONSTRAINT "FK_ticket_status_history_ticket"`,
    );

    await queryRunner.query(`DROP TABLE "ticket_status_history"`);
  }
}
