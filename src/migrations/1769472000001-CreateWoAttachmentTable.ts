import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWoAttachmentTable1769472000001
  implements MigrationInterface {
  name = 'CreateWoAttachmentTable1769472000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "wo_attachment" (
        "id" SERIAL NOT NULL,
        "filename" character varying NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "woId" integer,
        "uploadedById" integer,
        "uploadedByCustomerUserId" integer,
        CONSTRAINT "PK_wo_attachment_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      ADD CONSTRAINT "FK_wo_attachment_wo"
      FOREIGN KEY ("woId") REFERENCES "wo"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      ADD CONSTRAINT "FK_wo_attachment_uploaded_by"
      FOREIGN KEY ("uploadedById") REFERENCES "user_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      ADD CONSTRAINT "FK_wo_attachment_uploaded_by_customer_user"
      FOREIGN KEY ("uploadedByCustomerUserId") REFERENCES "customer_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_attachment_wo_id" ON "wo_attachment" ("woId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_attachment_uploaded_by_id" ON "wo_attachment" ("uploadedById")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_wo_attachment_uploaded_by_customer_user_id" ON "wo_attachment" ("uploadedByCustomerUserId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_wo_attachment_uploaded_by_customer_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_wo_attachment_uploaded_by_id"`);
    await queryRunner.query(`DROP INDEX "IDX_wo_attachment_wo_id"`);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      DROP CONSTRAINT "FK_wo_attachment_uploaded_by_customer_user"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      DROP CONSTRAINT "FK_wo_attachment_uploaded_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "wo_attachment"
      DROP CONSTRAINT "FK_wo_attachment_wo"
    `);

    await queryRunner.query(`DROP TABLE "wo_attachment"`);
  }
}

