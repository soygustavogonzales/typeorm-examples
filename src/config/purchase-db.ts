import { join } from 'path';

const synchronize = () => {
  if (process.env.TYPEORM_SYNCHRONIZE) {
    return process.env.TYPEORM_SYNCHRONIZE === 'true';
  }
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  return false;
};

export default {
  type: 'postgres',
  name: 'purchase-db',
  host: process.env.TYPEORM_HOST,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT) || 5432,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  keepConnectionAlive: true,
  logging: false,
  logger: 'debug',
  // Implementaremos Migrations.
  /** Recursos
   *  * https://typeorm.io/#/migrations
   */
  migrationsRun: true,
  migrations: [join(__dirname, '../migration/**/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: 'src/migration',
    entitiesDir: __dirname + '/../**/**/*entity{.ts,.js}',
  },
  synchronize: false,
};
