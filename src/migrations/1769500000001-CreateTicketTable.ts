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
        "createdByUserId" integer,
        "createdByCustomerId" integer,
        "requesterUserId" integer,
        "requesterCustomerId" integer,
        "assignedAgentId" integer,
        CONSTRAINT "PK_ticket_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_created_by_user"
      FOREIGN KEY ("createdByUserId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_created_by_customer"
      FOREIGN KEY ("createdByCustomerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_requester_user"
      FOREIGN KEY ("requesterUserId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_requester_customer"
      FOREIGN KEY ("requesterCustomerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD CONSTRAINT "FK_ticket_assigned_agent"
      FOREIGN KEY ("assignedAgentId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_created_by_user_id" ON "ticket" ("createdByUserId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_created_by_customer_id" ON "ticket" ("createdByCustomerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_requester_user_id" ON "ticket" ("requesterUserId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_requester_customer_id" ON "ticket" ("requesterCustomerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_assigned_agent_id" ON "ticket" ("assignedAgentId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ticket_company" ON "ticket" ("company")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ticket_company"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_assigned_agent_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_requester_customer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_requester_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_created_by_customer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_ticket_created_by_user_id"`);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_assigned_agent"
    `);
    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_requester_customer"
    `);
    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_requester_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_created_by_customer"
    `);
    await queryRunner.query(`
      ALTER TABLE "ticket"
      DROP CONSTRAINT "FK_ticket_created_by_user"
    `);

    await queryRunner.query(`DROP TABLE "ticket"`);
  }
}
