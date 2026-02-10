import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlatformToTicket1769500000005 implements MigrationInterface {
  name = 'AddPlatformToTicket1769500000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD COLUMN "platform" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ticket" DROP COLUMN "platform"
    `);
  }
}
