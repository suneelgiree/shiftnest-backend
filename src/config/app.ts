import dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  name: process.env.APP_NAME || 'ShiftNest',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
};
