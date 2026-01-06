import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullCompanyValuesToRscsInVendor1755094881348
  implements MigrationInterface
{
  name = 'UpdateNullCompanyValuesToRscsInVendor1755094881348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "vendor" SET "company" = 'rscs' WHERE "company" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "vendor" SET "company" = NULL WHERE "company" = 'rscs'`,
    );
  }
}
