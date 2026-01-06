import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullCompanyValuesToRscs1755094881343
  implements MigrationInterface
{
  name = 'UpdateNullCompanyValuesToRscs1755094881343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all customer records where company is null to "rscs"
    await queryRunner.query(
      `UPDATE "customer" SET "company" = 'rscs' WHERE "company" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes by setting company back to null for records that were "rscs"
    // Note: This is a destructive operation and should be used carefully
    // as it will set ALL records with "rscs" back to null, not just the ones that were originally null
    await queryRunner.query(
      `UPDATE "customer" SET "company" = NULL WHERE "company" = 'rscs'`,
    );
  }
}
