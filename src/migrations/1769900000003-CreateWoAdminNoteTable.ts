import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWoAdminNoteTable1769900000003 implements MigrationInterface {
  name = 'CreateWoAdminNoteTable1769900000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wo_admin_note" (
        "id" SERIAL NOT NULL,
        "note" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "woId" integer,
        "createdById" integer,
        CONSTRAINT "PK_wo_admin_note_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_admin_note"
      ADD CONSTRAINT "FK_wo_admin_note_wo"
      FOREIGN KEY ("woId") REFERENCES "wo"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_admin_note"
      ADD CONSTRAINT "FK_wo_admin_note_created_by"
      FOREIGN KEY ("createdById") REFERENCES "user_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_admin_note_wo_id" ON "wo_admin_note" ("woId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_wo_admin_note_wo_id"`);

    await queryRunner.query(`
      ALTER TABLE "wo_admin_note"
      DROP CONSTRAINT "FK_wo_admin_note_created_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_admin_note"
      DROP CONSTRAINT "FK_wo_admin_note_wo"
    `);

    await queryRunner.query(`DROP TABLE "wo_admin_note"`);
  }
}
