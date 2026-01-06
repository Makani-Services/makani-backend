import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullCompanyValuesToRscsInBranch1755094881346
  implements MigrationInterface
{
  name = 'UpdateNullCompanyValuesToRscsInBranch1755094881346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all branch records where company is null to "rscs"
    await queryRunner.query(
      `UPDATE "branch" SET "company" = 'rscs' WHERE "company" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes by setting company back to null for records that were "rscs"
    // Note: This is a destructive operation and should be used carefully
    // as it will set ALL records with "rscs" back to null, not just the ones that were originally null
    await queryRunner.query(
      `UPDATE "branch" SET "company" = NULL WHERE "company" = 'rscs'`,
    );
  }
}
