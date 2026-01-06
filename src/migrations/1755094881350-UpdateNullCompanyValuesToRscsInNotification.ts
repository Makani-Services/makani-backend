import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullCompanyValuesToRscsInNotification1755094881350
  implements MigrationInterface
{
  name = 'UpdateNullCompanyValuesToRscsInNotification1755094881350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "notification" SET "company" = 'rscs' WHERE "company" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This will set back to NULL, but we can't distinguish between
    // originally NULL values and those that were set to 'rscs' by this migration
    await queryRunner.query(
      `UPDATE "notification" SET "company" = NULL WHERE "company" = 'rscs'`,
    );
  }
}
