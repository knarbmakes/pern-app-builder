import { DataSource, DataSourceOptions } from 'typeorm';
import * as glob from 'glob';
import { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } from './envConfig';
import { logger } from './core/logger';

// Dynamically load all entity files
const entityFiles = glob.sync('src/models/**/*.@(ts|js)');
logger.info(`Globbed entities: ${JSON.stringify(entityFiles)}`);

// Create a new DataSource instance without initializing it
export const appDataSource = new DataSource({
  type: 'postgres',
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  synchronize: true,
  logging: false,
  entities: entityFiles,
});

export async function connectDB(): Promise<void> {
  try {
    await appDataSource.initialize(); // Initialize the data source
    logger.info('Connected to the database');
  } catch (error) {
    logger.error(`Error connecting to the database: ${error}`);
    throw error;
  }
}
