"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.appConfig = {
    name: process.env.APP_NAME || 'ShiftNest',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
};
//# sourceMappingURL=app.js.map