import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameBusinessToCompany1703123456789
  implements MigrationInterface
{
  name = 'RenameBusinessToCompany1703123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invite" RENAME COLUMN "business" TO "company"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invite" RENAME COLUMN "company" TO "business"`,
    );
  }
}
