import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWoTagTable1769900000000 implements MigrationInterface {
  name = 'CreateWoTagTable1769900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wo_tag" (
        "id" SERIAL NOT NULL,
        "name" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_wo_tag_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD COLUMN "tagId" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD CONSTRAINT "FK_wo_tag"
      FOREIGN KEY ("tagId") REFERENCES "wo_tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "wo_attachment_tag" (
        "attachmentId" integer NOT NULL,
        "tagId" integer NOT NULL,
        CONSTRAINT "PK_wo_attachment_tag" PRIMARY KEY ("attachmentId", "tagId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment_tag"
      ADD CONSTRAINT "FK_wo_attachment_tag_attachment"
      FOREIGN KEY ("attachmentId") REFERENCES "wo_attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment_tag"
      ADD CONSTRAINT "FK_wo_attachment_tag_tag"
      FOREIGN KEY ("tagId") REFERENCES "wo_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_attachment_tag_attachment" ON "wo_attachment_tag" ("attachmentId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_attachment_tag_tag" ON "wo_attachment_tag" ("tagId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_wo_attachment_tag_tag"`);
    await queryRunner.query(`DROP INDEX "IDX_wo_attachment_tag_attachment"`);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment_tag"
      DROP CONSTRAINT "FK_wo_attachment_tag_tag"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment_tag"
      DROP CONSTRAINT "FK_wo_attachment_tag_attachment"
    `);

    await queryRunner.query(`DROP TABLE "wo_attachment_tag"`);

    await queryRunner.query(`
      ALTER TABLE "wo"
      DROP CONSTRAINT "FK_wo_tag"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo" DROP COLUMN "tagId"
    `);

    await queryRunner.query(`DROP TABLE "wo_tag"`);
  }
}
