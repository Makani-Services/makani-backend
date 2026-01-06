import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyColumnToReport1755094881351
  implements MigrationInterface
{
  name = 'AddCompanyColumnToReport1755094881351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "report" ADD COLUMN "company" character varying`,
    );

    // Create index on the company column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_report_company" ON "report" ("company")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_report_company"`);

    // Drop the column
    await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "company"`);
  }
}
