import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRefrigerantColumnsFromWo1769472000000
  implements MigrationInterface {
  name = 'RemoveRefrigerantColumnsFromWo1769472000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove refrigerantQuantity column from wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      DROP COLUMN IF EXISTS "refrigerantQuantity"
    `);

    // Remove refrigerantType column from wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      DROP COLUMN IF EXISTS "refrigerantType"
    `);

    // Remove isRefrigerantAdded column from wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      DROP COLUMN IF EXISTS "isRefrigerantAdded"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add isRefrigerantAdded column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD COLUMN IF NOT EXISTS "isRefrigerantAdded" boolean
    `);

    // Add refrigerantType column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD COLUMN IF NOT EXISTS "refrigerantType" character varying
    `);

    // Add refrigerantQuantity column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD COLUMN IF NOT EXISTS "refrigerantQuantity" numeric
    `);
  }
}

