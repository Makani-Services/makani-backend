import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserBusinessToCompany1703123456790
  implements MigrationInterface
{
  name = 'RenameUserBusinessToCompany1703123456790';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" RENAME COLUMN "business" TO "company"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" RENAME COLUMN "company" TO "business"`,
    );
  }
}
