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
        "appVersion" character varying,
        "status" smallint NOT NULL,
        "company" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdById" integer,
        CONSTRAINT "PK_ticket_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_created_by"
      FOREIGN KEY ("createdById") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_company" ON "ticket" ("company")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_created_by_id" ON "ticket" ("createdById")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ticket_created_by_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_company"`);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_created_by"
    `);

    await queryRunner.query(`DROP TABLE "ticket"`);
  }
}
