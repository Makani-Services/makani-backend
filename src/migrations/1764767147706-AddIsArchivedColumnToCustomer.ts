import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsArchivedColumnToCustomer1764767147706
  implements MigrationInterface
{
  name = 'AddIsArchivedColumnToCustomer1764767147706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" ADD COLUMN "isArchived" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP COLUMN "isArchived"`,
    );
  }
}

