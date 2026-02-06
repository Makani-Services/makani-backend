import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketMessageTable1769500000002
  implements MigrationInterface
{
  name = 'CreateTicketMessageTable1769500000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_message" (
        "id" SERIAL NOT NULL,
        "message" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "ticketId" integer NOT NULL,
        "senderId" integer,
        "senderCustomerId" integer,
        CONSTRAINT "PK_ticket_message_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_message"
      ADD CONSTRAINT "FK_ticket_message_ticket"
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_message"
      ADD CONSTRAINT "FK_ticket_message_sender_user"
      FOREIGN KEY ("senderId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_message"
      ADD CONSTRAINT "FK_ticket_message_sender_customer"
      FOREIGN KEY ("senderCustomerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_message_ticket_id" ON "ticket_message" ("ticketId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_message_sender_id" ON "ticket_message" ("senderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_message_sender_customer_id" ON "ticket_message" ("senderCustomerId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ticket_message_sender_customer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_message_sender_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_message_ticket_id"`);

    await queryRunner.query(`
      ALTER TABLE "ticket_message" DROP CONSTRAINT "FK_ticket_message_sender_customer"
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_message" DROP CONSTRAINT "FK_ticket_message_sender_user"
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_message" DROP CONSTRAINT "FK_ticket_message_ticket"
    `);

    await queryRunner.query(`DROP TABLE "ticket_message"`);
  }
}
