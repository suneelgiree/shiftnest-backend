import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET as string || 'your_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN as string || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET as string || 'your_refresh_secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string || '30d',
};
