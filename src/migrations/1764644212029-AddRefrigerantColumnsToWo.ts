import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefrigerantColumnsToWo1764644212029
  implements MigrationInterface
{
  name = 'AddRefrigerantColumnsToWo1764644212029';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
}
