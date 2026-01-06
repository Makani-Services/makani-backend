import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyColumnToCustomer1755094881342
  implements MigrationInterface
{
  name = 'AddCompanyColumnToCustomer1755094881342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "company" character varying`,
    );

    // Create index on the company column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_customer_company" ON "customer" ("company")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_customer_company"`);

    // Drop the column
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "company"`);
  }
}
