import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactAndEmailToCustomer1769700000000
  implements MigrationInterface
{
  name = 'AddContactAndEmailToCustomer1769700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "customer"
      ADD COLUMN "contact" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "customer"
      ADD COLUMN "email" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "customer" DROP COLUMN "email"
    `);

    await queryRunner.query(`
      ALTER TABLE "customer" DROP COLUMN "contact"
    `);
  }
}
