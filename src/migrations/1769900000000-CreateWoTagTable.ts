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
      ADD "tagId" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD CONSTRAINT "FK_wo_tag"
      FOREIGN KEY ("tagId") REFERENCES "wo_tag"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wo"
      DROP CONSTRAINT "FK_wo_tag"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo"
      DROP COLUMN "tagId"
    `);

    await queryRunner.query(`DROP TABLE "wo_tag"`);
  }
}
