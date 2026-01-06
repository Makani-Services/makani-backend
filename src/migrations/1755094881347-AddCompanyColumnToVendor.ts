import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyColumnToVendor1755094881347
  implements MigrationInterface
{
  name = 'AddCompanyColumnToVendor1755094881347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor" ADD COLUMN "company" character varying`,
    );

    // Create index on the company column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_company" ON "vendor" ("company")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_vendor_company"`);

    // Drop the column
    await queryRunner.query(`ALTER TABLE "vendor" DROP COLUMN "company"`);
  }
}
