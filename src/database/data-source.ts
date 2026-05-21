import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  entities: [
    'dist/models/**/*.js',
  ],
  migrations: ['dist/database/migrations/**/*.js'],
  subscribers: ['dist/database/subscribers/**/*.js'],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection established');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};
