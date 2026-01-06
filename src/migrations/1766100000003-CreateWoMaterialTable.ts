import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWoMaterialTable1766100000003 implements MigrationInterface {
  name = 'CreateWoMaterialTable1766100000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wo_material" (
        "id" SERIAL NOT NULL,
        "isAdded" boolean,
        "quantity" numeric,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "workOrderId" integer,
        "materialTypeId" integer,
        "materialCategoryId" integer,
        CONSTRAINT "PK_wo_material_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_material"
      ADD CONSTRAINT "FK_wo_material_work_order"
      FOREIGN KEY ("workOrderId") REFERENCES "wo"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_material"
      ADD CONSTRAINT "FK_wo_material_material_type"
      FOREIGN KEY ("materialTypeId") REFERENCES "material_type"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_material"
      ADD CONSTRAINT "FK_wo_material_material_category"
      FOREIGN KEY ("materialCategoryId") REFERENCES "material_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_material_work_order_id" ON "wo_material" ("workOrderId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_material_material_type_id" ON "wo_material" ("materialTypeId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_material_material_category_id" ON "wo_material" ("materialCategoryId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_wo_material_material_category_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_wo_material_material_type_id"`);
    await queryRunner.query(`DROP INDEX "IDX_wo_material_work_order_id"`);

    await queryRunner.query(`
      ALTER TABLE "wo_material"
      DROP CONSTRAINT "FK_wo_material_material_category"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_material"
      DROP CONSTRAINT "FK_wo_material_material_type"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_material"
      DROP CONSTRAINT "FK_wo_material_work_order"
    `);

    await queryRunner.query(`DROP TABLE "wo_material"`);
  }
}
