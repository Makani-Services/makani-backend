import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuotedByToWo1767000000004 implements MigrationInterface {
  name = 'AddQuotedByToWo1767000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add quotedById column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD COLUMN "quotedById" integer
    `);

    // Create foreign key constraint to user_entity table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD CONSTRAINT "FK_wo_quoted_by_user"
      FOREIGN KEY ("quotedById") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Create index for quotedById
    await queryRunner.query(`
      CREATE INDEX "IDX_wo_quoted_by_id" ON "wo" ("quotedById")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_wo_quoted_by_id"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "wo" DROP CONSTRAINT "FK_wo_quoted_by_user"`,
    );

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "wo" DROP COLUMN "quotedById"
    `);
  }
}
