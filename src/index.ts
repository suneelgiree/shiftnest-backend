import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { initializeDatabase } from './database/data-source';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { initWebSocket } from './websocket/tracking';
import { initChatWebSocket } from './websocket/chat';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';
import { swaggerSpec } from './config/swagger';

// Routes
import userRoutes        from './routes/userRoutes';
import shiftRoutes       from './routes/shiftRoutes';
import assignmentRoutes  from './routes/assignmentRoutes';
import authRoutes        from './routes/authRoutes';
import roomRoutes        from './routes/roomRoutes';
import shiftBookingRoutes from './routes/shiftBookingRoutes';
import paymentRoutes     from './routes/paymentRoutes';
import reviewRoutes      from './routes/reviewRoutes';
import adminRoutes       from './routes/adminRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import chatRoutes from './routes/chatRoutes';
import driverRoutes from './routes/driverRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), app: 'ShiftNest API' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/rooms',          roomRoutes);
app.use('/api/shift-bookings', shiftBookingRoutes);
app.use('/api/payments',       paymentRoutes);
app.use('/api/reviews',        reviewRoutes);
app.use('/api/admin',          adminRoutes);
app.use('/api/shifts',         shiftRoutes);
app.use('/api/assignments',    assignmentRoutes);
app.use('/api/subscription',   subscriptionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/driver', driverRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.path });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    const server = createServer(app);
    initWebSocket(server);
    initChatWebSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 ShiftNest API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: ${process.env.APP_URL}`);
      console.log('\n📚 Endpoints:');
      console.log('  Auth:           /api/auth');
      console.log('  Rooms:          /api/rooms');
      console.log('  Shift bookings: /api/shift-bookings');
      console.log('  Payments:       /api/payments');
      console.log('  Reviews:        /api/reviews');
      console.log('  Admin:          /api/admin');
      console.log('  WebSocket:      ws://localhost:3000/ws/tracking?shiftId=&token=');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
export default app;