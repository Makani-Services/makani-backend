import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyColumnToCustomerRole1757769003378
  implements MigrationInterface
{
  name = 'AddCompanyColumnToCustomerRole1757769003378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add company column to customer_role table
    await queryRunner.query(`
      ALTER TABLE "customer_role" 
      ADD COLUMN "company" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove company column from customer_role table
    await queryRunner.query(`
      ALTER TABLE "customer_role" 
      DROP COLUMN "company"
    `);
  }
}
