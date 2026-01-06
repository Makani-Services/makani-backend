import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCustomerRefreshSessionTable1755094881354
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customer_refresh_session',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'refreshToken',
            type: 'varchar',
          },
          {
            name: 'expiresIn',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'int',
          },
          {
            name: 'customerUserId',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['customerUserId'],
            referencedTableName: 'customer_user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customer_refresh_session');
  }
}
