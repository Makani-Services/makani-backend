import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSuperAdminRole1769600000000 implements MigrationInterface {
  name = 'SeedSuperAdminRole1769600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role" ("name")
      VALUES ('Super Admin')
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role"
      WHERE "name" = 'Super Admin'
    `);
  }
}
