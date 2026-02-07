import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedServiceTypes1769472000005 implements MigrationInterface {
  name = 'SeedServiceTypes1769472000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "service_type" ("id", "serviceType", "backgroundColor", "isArchived", "company")
      VALUES 
        (1, 'Service Call', '#BFD9FF', false, 'rscs'),
        (2, 'Quoted Job', '#F7C7C5', false, 'rscs'),
        (3, 'PM', '#C5E9C6', false, 'rscs'),
        (4, 'Parts Only', '#FFF9BF', false, 'rscs'),
        (5, 'Compressor Rebuild', '#FFEBC5', false, 'rscs')
      ON CONFLICT ("id") DO NOTHING
    `);

    // Reset sequence so future inserts work correctly after explicit id insert
    await queryRunner.query(`
      SELECT setval(
        pg_get_serial_sequence('service_type', 'id'),
        COALESCE((SELECT MAX("id") FROM "service_type"), 1)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "service_type" 
      WHERE "id" IN (1, 2, 3, 4, 5) AND "company" = 'rscs'
    `);
  }
}
