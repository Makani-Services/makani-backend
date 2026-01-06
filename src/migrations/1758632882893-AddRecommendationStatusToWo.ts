import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecommendationStatusToWo1758632882893
  implements MigrationInterface
{
  name = 'AddRecommendationStatusToWo1758632882893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add recommendationStatus column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      ADD COLUMN "recommendationStatus" integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove recommendationStatus column from wo table
    await queryRunner.query(`
      ALTER TABLE "wo" 
      DROP COLUMN "recommendationStatus"
    `);
  }
}
