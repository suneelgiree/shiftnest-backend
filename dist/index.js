"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("express-async-errors");
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./database/data-source");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Import routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const shiftRoutes_1 = __importDefault(require("./routes/shiftRoutes"));
const assignmentRoutes_1 = __importDefault(require("./routes/assignmentRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/users', userRoutes_1.default);
app.use('/api/shifts', shiftRoutes_1.default);
app.use('/api/assignments', assignmentRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Initialize database and start server
const startServer = async () => {
    try {
        await (0, data_source_1.initializeDatabase)();
        console.log('✅ Database initialized successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 API URL: ${process.env.APP_URL}`);
            console.log('\n📚 API Endpoints:');
            console.log('  Users: POST /api/users/register, POST /api/users/login');
            console.log('  Shifts: GET/POST /api/shifts');
            console.log('  Assignments: GET/POST /api/assignments');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map