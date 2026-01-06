import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMaterialCategoryTable1766100000001
  implements MigrationInterface
{
  name = 'CreateMaterialCategoryTable1766100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "material_category" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "unit" character varying(50) NOT NULL,
        "isMandatory" boolean NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "company" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_material_category_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_material_category_name" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "material_category"`);
  }
}
