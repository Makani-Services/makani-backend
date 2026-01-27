import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketTable1769500000001 implements MigrationInterface {
  name = 'CreateTicketTable1769500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ticket" (
        "id" SERIAL NOT NULL,
        "number" character varying,
        "subject" character varying,
        "description" character varying,
        "woNumber" character varying,
        "poNumber" character varying,
        "status" smallint NOT NULL,
        "createdById" integer,
        "company" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ticket_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_createdBy"
      FOREIGN KEY ("createdById") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_company" ON "ticket" ("company")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_createdById" ON "ticket" ("createdById")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ticket_createdById"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_company"`);

    await queryRunner.query(
      `ALTER TABLE "ticket" DROP CONSTRAINT "FK_ticket_createdBy"`,
    );

    await queryRunner.query(`DROP TABLE "ticket"`);
  }
}

