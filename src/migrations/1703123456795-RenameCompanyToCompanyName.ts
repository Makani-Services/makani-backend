import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCompanyToCompanyName1703123456795
  implements MigrationInterface
{
  name = 'RenameCompanyToCompanyName1703123456795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" RENAME COLUMN "company" TO "companyName"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" RENAME COLUMN "companyName" TO "company"`,
    );
  }
}
