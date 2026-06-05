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
  require('../models/User').User,
  require('../models/Room').Room,
  require('../models/RoomFacility').RoomFacility,
  require('../models/RoomImage').RoomImage,
  require('../models/RoomBooking').RoomBooking,
  require('../models/SavedRoom').SavedRoom,
  require('../models/Shift').Shift,
  require('../models/ShiftAssignment').ShiftAssignment,
  require('../models/Vehicle').Vehicle,
  require('../models/Driver').Driver,
  require('../models/ShiftBooking').ShiftBooking,
  require('../models/Payment').Payment,
  require('../models/Review').Review,
  require('../models/Conversation').Conversation,
  require('../models/Message').Message,
  require('../models/DriverApplication').DriverApplication,
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
