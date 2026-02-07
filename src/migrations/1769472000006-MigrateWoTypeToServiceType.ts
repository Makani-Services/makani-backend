import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateWoTypeToServiceType1769472000006
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE wo
      SET "serviceTypeId" = CASE type
        WHEN 0 THEN 1
        WHEN 1 THEN 2
        WHEN 2 THEN 3
        WHEN 3 THEN 4
        WHEN 4 THEN 5
      END
      WHERE type IS NOT NULL
        AND "serviceTypeId" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE wo
      SET type = CASE "serviceTypeId"
        WHEN 1 THEN 0
        WHEN 2 THEN 1
        WHEN 3 THEN 2
        WHEN 4 THEN 3
        WHEN 5 THEN 4
      END
      WHERE "serviceTypeId" IS NOT NULL
        AND type IS NULL;
    `);
  }
}
