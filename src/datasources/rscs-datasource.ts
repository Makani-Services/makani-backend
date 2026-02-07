import { DataSourceOptions, DataSource } from 'typeorm';
import { default as config } from '../config';
import { join } from 'path';

export const rscsDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.pass,
  database: 'rscs',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsRun: false,
  synchronize: false,
  logging: false,
  extra: {
    ssl:
      process.env.SSL_MODE === 'require'
        ? {
          rejectUnauthorized: false,
        }
        : false,
  },
};

export const rscsDataSource = new DataSource(rscsDataSourceOptions);
