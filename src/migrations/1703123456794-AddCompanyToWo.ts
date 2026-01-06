import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyToWo1703123456794 implements MigrationInterface {
  name = 'AddCompanyToWo1703123456794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wo" ADD COLUMN "company" character varying`,
    );

    // Create index on the company column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_wo_company" ON "wo" ("company")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_wo_company"`);

    // Drop the column
    await queryRunner.query(`ALTER TABLE "wo" DROP COLUMN "company"`);
  }
}
