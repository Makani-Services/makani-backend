import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentBranchToUser1768000000000
  implements MigrationInterface
{
  name = 'AddCurrentBranchToUser1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_entity" ADD COLUMN "currentBranchId" integer`,
    );

    await queryRunner.query(`
      ALTER TABLE "user_entity"
      ADD CONSTRAINT "FK_user_entity_currentBranch"
      FOREIGN KEY ("currentBranchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_entity_currentBranchId" ON "user_entity" ("currentBranchId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_user_entity_currentBranchId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_entity" DROP CONSTRAINT "FK_user_entity_currentBranch"`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_entity" DROP COLUMN "currentBranchId"`,
    );
  }
}
