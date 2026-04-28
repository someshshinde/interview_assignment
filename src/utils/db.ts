import { Sequelize } from 'sequelize';
import logger from './logger';

const db = new Sequelize(
  process.env.DATABASE_NAME as string,
  process.env.DATABASE_USER as string,
  process.env.DATABASE_PASSWORD as string,
  {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql',
    logging: false
  }
);

export const dbConnection = async (): Promise<void> => {
  try {
    await db.authenticate();
    logger.info('Database Connected Successfully');
  } catch (error) {
    logger.error('Database Connection Failed', error);
    process.exit(1);
  }
};

export default db;