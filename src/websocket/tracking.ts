import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/data-source';
import { Driver } from '../models/Driver';
import { ShiftBooking } from '../models/ShiftBooking';
import { Logger } from '../utils/logger';

interface TrackingClient {
  ws: WebSocket;
  shiftId: string;
  userId: string;
  role: 'user' | 'driver';
}

// Map of shiftId -> connected clients
const clients = new Map<string, Set<TrackingClient>>();

function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function addClient(client: TrackingClient) {
  if (!clients.has(client.shiftId)) {
    clients.set(client.shiftId, new Set());
  }
  clients.get(client.shiftId)!.add(client);
}

function removeClient(client: TrackingClient) {
  const room = clients.get(client.shiftId);
  if (room) {
    room.delete(client);
    if (room.size === 0) clients.delete(client.shiftId);
  }
}

function broadcastToShift(shiftId: string, data: object, excludeWs?: WebSocket) {
  const room = clients.get(shiftId);
  if (!room) return;
  room.forEach((client) => {
    if (client.ws !== excludeWs) {
      send(client.ws, data);
    }
  });
}

export function initWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/tracking' });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // Parse shiftId and token from URL
    // URL format: /ws/tracking?shiftId=SH00001&token=JWT
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const shiftId = url.searchParams.get('shiftId');
    const token = url.searchParams.get('token');

    // Validate token
    if (!token || !shiftId) {
      send(ws, { type: 'ERROR', message: 'shiftId and token are required' });
      ws.close();
      return;
    }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      send(ws, { type: 'ERROR', message: 'Invalid token' });
      ws.close();
      return;
    }

    // Check shift exists
    const shiftBookingRepo = AppDataSource.getRepository(ShiftBooking);
    const booking = await shiftBookingRepo.findOne({
      where: { bookingId: shiftId },
      relations: ['driver'],
    });

    if (!booking) {
      send(ws, { type: 'ERROR', message: 'Shift not found' });
      ws.close();
      return;
    }

    // Determine role
    const isDriver = booking.driver?.userId === payload.id;
    const isUser = booking.userId === payload.id;
    const isAdmin = payload.role === 'admin';

    if (!isDriver && !isUser && !isAdmin) {
      send(ws, { type: 'ERROR', message: 'Unauthorized' });
      ws.close();
      return;
    }

    const client: TrackingClient = {
      ws,
      shiftId: booking.id,
      userId: payload.id,
      role: isDriver ? 'driver' : 'user',
    };

    addClient(client);
    Logger.info(`WS connected: ${payload.email} for shift ${booking.bookingId}`);

    // Send current status on connect
    send(ws, {
      type: 'CONNECTED',
      shiftId: booking.bookingId,
      status: booking.status,
      driver: booking.driver ? {
        currentLat: booking.driver.currentLat,
        currentLng: booking.driver.currentLng,
        plateNumber: booking.driver.plateNumber,
      } : null,
    });

    // Handle incoming messages
    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Driver sends location update
        if (msg.type === 'LOCATION_UPDATE' && client.role === 'driver') {
          const { lat, lng } = msg;
          if (!lat || !lng) return;

          // Update driver location in DB
          const driverRepo = AppDataSource.getRepository(Driver);
          await driverRepo.update(
            { userId: payload.id },
            { currentLat: lat, currentLng: lng }
          );

          // Update shift status to ON_THE_WAY if CONFIRMED
          if (booking.status === 'CONFIRMED') {
            await shiftBookingRepo.update(booking.id, { status: 'ON_THE_WAY' });
            booking.status = 'ON_THE_WAY';
          }

          // Broadcast to all users watching this shift
          broadcastToShift(booking.id, {
            type: 'DRIVER_LOCATION',
            lat,
            lng,
            status: booking.status,
            timestamp: new Date().toISOString(),
          }, ws);

          Logger.info(`Driver location update for shift ${booking.bookingId}: ${lat}, ${lng}`);
        }

        // Driver marks shift as completed
        if (msg.type === 'SHIFT_COMPLETED' && client.role === 'driver') {
          await shiftBookingRepo.update(booking.id, { status: 'COMPLETED' });

          // Free up driver
          const driverRepo = AppDataSource.getRepository(Driver);
          await driverRepo.update({ userId: payload.id }, { isAvailable: true });

          broadcastToShift(booking.id, {
            type: 'SHIFT_COMPLETED',
            shiftId: booking.bookingId,
            message: 'Shift completed successfully',
            timestamp: new Date().toISOString(),
          });

          Logger.info(`Shift completed: ${booking.bookingId}`);
        }

      } catch (error) {
        Logger.error('WS message error', error);
        send(ws, { type: 'ERROR', message: 'Invalid message format' });
      }
    });

    ws.on('close', () => {
      removeClient(client);
      Logger.info(`WS disconnected: ${payload.email} from shift ${booking.bookingId}`);
    });

    ws.on('error', (error) => {
      Logger.error('WS error', error);
      removeClient(client);
    });
  });

  Logger.info('WebSocket server initialized at /ws/tracking');
  return wss;
}
