import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateWoAttachmentsData1769472000002
  implements MigrationInterface {
  name = 'MigrateWoAttachmentsData1769472000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * Move wo.attachments[] → wo_attachment rows
     * - filename comes from array value
     * - uploadedAt uses wo.createdAt
     * - uploadedBy is NULL (legacy data)
     */
    await queryRunner.query(`
      INSERT INTO "wo_attachment" ("fileName", "woId")
      SELECT
        unnest("attachments") AS "fileName",
        "id" AS "woId"
      FROM "wo"
      WHERE "attachments" IS NOT NULL
        AND array_length("attachments", 1) > 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Rollback strategy:
     * Just delete migrated rows.
     * Original wo.attachments[] is untouched.
     */
    await queryRunner.query(`
      DELETE FROM "wo_attachment"
    `);
  }
}
