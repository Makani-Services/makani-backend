import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmailAndContactFromCustomer1755094881344
  implements MigrationInterface
{
  name = 'RemoveEmailAndContactFromCustomer1755094881344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if email column exists before trying to remove it
    const emailColumnExists = await queryRunner.hasColumn('customer', 'email');
    if (emailColumnExists) {
      await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "email"`);
    }

    // Check if contact column exists before trying to remove it
    const contactColumnExists = await queryRunner.hasColumn(
      'customer',
      'contact',
    );
    if (contactColumnExists) {
      await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "contact"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add email column if it was removed
    const emailColumnExists = await queryRunner.hasColumn('customer', 'email');
    if (!emailColumnExists) {
      await queryRunner.query(
        `ALTER TABLE "customer" ADD COLUMN "email" character varying`,
      );
    }

    // Re-add contact column if it was removed
    const contactColumnExists = await queryRunner.hasColumn(
      'customer',
      'contact',
    );
    if (!contactColumnExists) {
      await queryRunner.query(
        `ALTER TABLE "customer" ADD COLUMN "contact" character varying`,
      );
    }
  }
}
