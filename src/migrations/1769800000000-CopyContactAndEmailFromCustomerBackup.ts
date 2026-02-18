import { MigrationInterface, QueryRunner } from 'typeorm';

export class CopyContactAndEmailFromCustomerBackup1769800000000
  implements MigrationInterface
{
  name = 'CopyContactAndEmailFromCustomerBackup1769800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "customer" c
      SET
        "contact" = cb."contact",
        "email" = cb."email"
      FROM "customer_backup" cb
      WHERE c."companyName" = cb."company"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "customer"
      SET
        "contact" = NULL,
        "email" = NULL
    `);
  }
}
