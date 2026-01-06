import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriorityLevelToWo1755094881357 implements MigrationInterface {
  name = 'AddPriorityLevelToWo1755094881357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add priorityLevel column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ADD COLUMN "priorityLevel" integer
    `);

    // Create index for better performance on priorityLevel
    await queryRunner.query(`
      CREATE INDEX "IDX_wo_priority_level" ON "wo" ("priorityLevel")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_wo_priority_level"`);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "wo" DROP COLUMN "priorityLevel"
    `);
  }
}
