import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullCompanyValues1755094881341
  implements MigrationInterface
{
  name = 'UpdateNullCompanyValues1755094881341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "wo" SET "company" = 'rscs' WHERE "company" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: We cannot safely revert this operation since we don't know which values were originally null
    // This is a one-way data migration
    console.log('Warning: Cannot safely revert company value updates');
  }
}
