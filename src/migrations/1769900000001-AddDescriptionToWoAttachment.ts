import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToWoAttachment1769900000001
  implements MigrationInterface
{
  name = 'AddDescriptionToWoAttachment1769900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      ADD COLUMN "description" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wo_attachment" DROP COLUMN "description"
    `);
  }
}
