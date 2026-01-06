import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullCompanyValuesToRscsInReport1755094881352
  implements MigrationInterface
{
  name = 'UpdateNullCompanyValuesToRscsInReport1755094881352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "report" SET "company" = 'rscs' WHERE "company" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This will set the company back to NULL for records that were originally NULL
    // This is a destructive operation and should be used with caution
    await queryRunner.query(
      `UPDATE "report" SET "company" = NULL WHERE "company" = 'rscs'`,
    );
  }
}
