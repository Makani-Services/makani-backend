import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketMessageAttachmentTable1769500000004
  implements MigrationInterface
{
  name = 'CreateTicketMessageAttachmentTable1769500000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_message_attachment" (
        "id" SERIAL NOT NULL,
        "messageId" integer NOT NULL,
        "fileName" character varying,
        "mimeType" character varying,
        "url" character varying,
        "size" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_message_attachment_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_message_attachment"
      ADD CONSTRAINT "FK_ticket_message_attachment_message"
      FOREIGN KEY ("messageId") REFERENCES "ticket_message"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_message_attachment_messageId" ON "ticket_message_attachment" ("messageId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ticket_message_attachment_messageId"`);

    await queryRunner.query(
      `ALTER TABLE "ticket_message_attachment" DROP CONSTRAINT "FK_ticket_message_attachment_message"`,
    );

    await queryRunner.query(`DROP TABLE "ticket_message_attachment"`);
  }
}

