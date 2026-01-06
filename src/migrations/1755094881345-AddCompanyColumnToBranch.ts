import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyColumnToBranch1755094881345
  implements MigrationInterface
{
  name = 'AddCompanyColumnToBranch1755094881345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branch" ADD COLUMN "company" character varying`,
    );

    // Create index on the company column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_branch_company" ON "branch" ("company")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_branch_company"`);

    // Drop the column
    await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "company"`);
  }
}
