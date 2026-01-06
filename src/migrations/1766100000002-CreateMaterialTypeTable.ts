import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMaterialTypeTable1766100000002
  implements MigrationInterface
{
  name = 'CreateMaterialTypeTable1766100000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "material_type" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "categoryId" integer NOT NULL,
        CONSTRAINT "PK_material_type_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "material_type"
      ADD CONSTRAINT "FK_material_type_category"
      FOREIGN KEY ("categoryId") REFERENCES "material_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_material_type_category_id" ON "material_type" ("categoryId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_material_type_category_id"`);
    await queryRunner.query(`
      ALTER TABLE "material_type"
      DROP CONSTRAINT "FK_material_type_category"
    `);
    await queryRunner.query(`DROP TABLE "material_type"`);
  }
}
