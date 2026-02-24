import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsBiometricsLoginEnabledToUser1769900000002
  implements MigrationInterface
{
  name = 'AddIsBiometricsLoginEnabledToUser1769900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" ADD COLUMN "isBiometricsLoginEnabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" DROP COLUMN "isBiometricsLoginEnabled"`,
    );
  }
}
