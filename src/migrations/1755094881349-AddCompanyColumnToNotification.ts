import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyColumnToNotification1755094881349
  implements MigrationInterface
{
  name = 'AddCompanyColumnToNotification1755094881349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD COLUMN "company" character varying`,
    );

    // Create index on the company column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_company" ON "notification" ("company")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_notification_company"`);

    // Drop the column
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "company"`);
  }
}
