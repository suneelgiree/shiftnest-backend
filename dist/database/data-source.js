"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
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
    ],
    migrations: ['dist/database/migrations/**/*.js'],
    subscribers: ['dist/database/subscribers/**/*.js'],
});
const initializeDatabase = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            console.log('Database connection established');
        }
    }
    catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=data-source.js.map