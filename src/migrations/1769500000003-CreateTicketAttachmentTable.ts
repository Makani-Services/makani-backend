import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketAttachmentTable1769500000003
  implements MigrationInterface
{
  name = 'CreateTicketAttachmentTable1769500000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket_attachment" (
        "id" SERIAL NOT NULL,
        "ticketId" integer NOT NULL,
        "fileName" character varying,
        "mimeType" character varying,
        "url" character varying,
        "size" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_attachment_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_attachment"
      ADD CONSTRAINT "FK_ticket_attachment_ticket"
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_attachment_ticket_id" ON "ticket_attachment" ("ticketId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ticket_attachment_ticket_id"`);
    await queryRunner.query(
      `ALTER TABLE "ticket_attachment" DROP CONSTRAINT "FK_ticket_attachment_ticket"`,
    );
    await queryRunner.query(`DROP TABLE "ticket_attachment"`);
  }
}
