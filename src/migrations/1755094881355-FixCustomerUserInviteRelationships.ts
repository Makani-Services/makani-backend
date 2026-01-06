import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCustomerUserInviteRelationships1755094881355
  implements MigrationInterface
{
  name = 'FixCustomerUserInviteRelationships1755094881355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure the customerId column exists and has proper constraints
    // This migration ensures the relationship between customer_user_invite and customer tables is properly established

    // Check if the foreign key constraint already exists, if not create it
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'FK_customer_user_invite_customer' 
          AND table_name = 'customer_user_invite'
        ) THEN
          ALTER TABLE "customer_user_invite" 
          ADD CONSTRAINT "FK_customer_user_invite_customer" 
          FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // Ensure proper indexes exist for the relationship
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'IDX_customer_user_invite_customer_id'
        ) THEN
          CREATE INDEX "IDX_customer_user_invite_customer_id" ON "customer_user_invite" ("customerId");
        END IF;
      END $$;
    `);

    // Add any missing columns that might be needed for the relationship
    // This ensures the table structure matches the entity definition
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'customer_user_invite' 
          AND column_name = 'customerId'
        ) THEN
          ALTER TABLE "customer_user_invite" ADD COLUMN "customerId" integer;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the indexes and constraints we added
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_customer_user_invite_customer_id";
    `);

    // Note: We don't drop the customerId column as it might be needed by other parts of the system
    // The foreign key constraint will be automatically handled by TypeORM
  }
}
