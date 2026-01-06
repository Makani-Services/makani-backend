import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueConstraintFromWoNumber1764328034723
  implements MigrationInterface
{
  name = 'RemoveUniqueConstraintFromWoNumber1764328034723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find the unique constraint name on wo.number column
    const constraintResult = await queryRunner.query(`
      SELECT tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'wo'
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name = 'number'
        AND tc.table_schema = 'public'
    `);

    // Drop all unique constraints found on the number column
    if (constraintResult && constraintResult.length > 0) {
      for (const row of constraintResult) {
        await queryRunner.query(
          `ALTER TABLE "wo" DROP CONSTRAINT IF EXISTS "${row.constraint_name}"`,
        );
      }
    } else {
      // Fallback: try common TypeORM constraint names
      await queryRunner.query(
        `ALTER TABLE "wo" DROP CONSTRAINT IF EXISTS "UQ_wo_number"`,
      );
      await queryRunner.query(
        `ALTER TABLE "wo" DROP CONSTRAINT IF EXISTS "UQ__wo__number"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the unique constraint on wo.number column
    await queryRunner.query(
      `ALTER TABLE "wo" ADD CONSTRAINT "UQ_wo_number" UNIQUE ("number")`,
    );
  }
}

