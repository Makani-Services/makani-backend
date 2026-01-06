import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCustomerRoles1764662066642 implements MigrationInterface {
  name = 'SeedCustomerRoles1764662066642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert customer roles for rscs company
    // Using ON CONFLICT DO NOTHING to handle cases where roles might already exist
    await queryRunner.query(`
      INSERT INTO "customer_role" ("name", "company")
      VALUES 
        ('Administrator', 'rscs'),
        ('Manager', 'rscs'),
        ('User', 'rscs')
      ON CONFLICT ("name") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the seeded customer roles for rscs company
    await queryRunner.query(`
      DELETE FROM "customer_role" 
      WHERE "name" IN ('Administrator', 'Manager', 'User') 
      AND "company" = 'rscs'
    `);
  }
}




