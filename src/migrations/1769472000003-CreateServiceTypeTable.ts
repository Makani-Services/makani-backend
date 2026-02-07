import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServiceTypeTable1769472000003
  implements MigrationInterface {
  name = 'CreateServiceTypeTable1769472000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "service_type" (
        "id" SERIAL NOT NULL,
        "serviceType" character varying NOT NULL,
        "backgroundColor" character varying NOT NULL,
        "isArchived" boolean NOT NULL DEFAULT false,
        "company" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_type_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "service_type"`);
  }
}
