import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceTypeToWo1769472000004 implements MigrationInterface {
  name = 'AddServiceTypeToWo1769472000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add serviceTypeId column to wo table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD COLUMN "serviceTypeId" integer
    `);

    // Create foreign key constraint to service_type table
    await queryRunner.query(`
      ALTER TABLE "wo"
      ADD CONSTRAINT "FK_wo_service_type"
      FOREIGN KEY ("serviceTypeId") REFERENCES "service_type"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create index for serviceTypeId
    await queryRunner.query(`
      CREATE INDEX "IDX_wo_service_type_id" ON "wo" ("serviceTypeId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_wo_service_type_id"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "wo" DROP CONSTRAINT "FK_wo_service_type"`,
    );

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "wo" DROP COLUMN "serviceTypeId"
    `);
  }
}
