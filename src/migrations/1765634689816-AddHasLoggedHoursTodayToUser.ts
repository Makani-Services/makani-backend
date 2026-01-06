import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasLoggedHoursTodayToUser1765634689816
  implements MigrationInterface
{
  name = 'AddHasLoggedHoursTodayToUser1765634689816';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" ADD COLUMN "hasLoggedHoursToday" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" DROP COLUMN "hasLoggedHoursToday"`,
    );
  }
}
