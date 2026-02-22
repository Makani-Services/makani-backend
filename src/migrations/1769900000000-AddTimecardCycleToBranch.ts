import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimecardCycleToBranch1769900000000
  implements MigrationInterface
{
  name = 'AddTimecardCycleToBranch1769900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branch" ADD COLUMN "timecardCycle" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "timecardCycle"`);
  }
}
