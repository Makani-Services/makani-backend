import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdentifierToCompany1703123456793 implements MigrationInterface {
  name = 'AddIdentifierToCompany1703123456793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company" ADD COLUMN "identifier" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "identifier"`);
  }
}
