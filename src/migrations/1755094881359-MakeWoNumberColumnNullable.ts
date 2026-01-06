import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeWoNumberColumnNullable1755094881359
  implements MigrationInterface
{
  name = 'MakeWoNumberColumnNullable1755094881359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make the number column nullable in wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ALTER COLUMN "number" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the number column to NOT NULL in wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ALTER COLUMN "number" SET NOT NULL
    `);
  }
}
