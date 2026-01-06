import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerNoteTable1758810759164
  implements MigrationInterface
{
  name = 'CreateCustomerNoteTable1758810759164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customer_note" (
        "id" SERIAL NOT NULL,
        "message" character varying,
        "senderType" integer,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "woId" integer,
        "senderId" integer,
        "customerSenderId" integer,
        CONSTRAINT "PK_customer_note_id" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key constraint to wo table
    await queryRunner.query(`
      ALTER TABLE "customer_note" 
      ADD CONSTRAINT "FK_customer_note_wo" 
      FOREIGN KEY ("woId") REFERENCES "wo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create foreign key constraint to user_entity table (technician sender)
    await queryRunner.query(`
      ALTER TABLE "customer_note" 
      ADD CONSTRAINT "FK_customer_note_sender" 
      FOREIGN KEY ("senderId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create foreign key constraint to customer_user table (customer sender)
    await queryRunner.query(`
      ALTER TABLE "customer_note" 
      ADD CONSTRAINT "FK_customer_note_customer_sender" 
      FOREIGN KEY ("customerSenderId") REFERENCES "customer_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customer_note_wo_id" ON "customer_note" ("woId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_note_sender_id" ON "customer_note" ("senderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_note_customer_sender_id" ON "customer_note" ("customerSenderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_note_sender_type" ON "customer_note" ("senderType")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customer_note_created_at" ON "customer_note" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_customer_note_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_note_sender_type"`);
    await queryRunner.query(
      `DROP INDEX "IDX_customer_note_customer_sender_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_customer_note_sender_id"`);
    await queryRunner.query(`DROP INDEX "IDX_customer_note_wo_id"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "customer_note" DROP CONSTRAINT "FK_customer_note_customer_sender"`,
    );

    await queryRunner.query(
      `ALTER TABLE "customer_note" DROP CONSTRAINT "FK_customer_note_sender"`,
    );

    await queryRunner.query(
      `ALTER TABLE "customer_note" DROP CONSTRAINT "FK_customer_note_wo"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "customer_note"`);
  }
}
