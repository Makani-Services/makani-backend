import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceModelAndDeviceOSToTicket1769500000006
  implements MigrationInterface
{
  name = 'AddDeviceModelAndDeviceOSToTicket1769500000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD COLUMN "deviceModel" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket"
      ADD COLUMN "deviceOS" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "ticket" DROP COLUMN "deviceOS"
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket" DROP COLUMN "deviceModel"
    `);
  }
}
