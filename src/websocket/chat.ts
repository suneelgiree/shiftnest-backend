import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/data-source';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { hasActiveAccess } from '../controllers/SubscriptionController';
import { Logger } from '../utils/logger';

// userId -> set of that user's live sockets
const clients = new Map<string, Set<WebSocket>>();

function send(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}

function pushToUser(userId: string, data: object) {
  const sockets = clients.get(userId);
  if (!sockets) return;
  sockets.forEach((ws) => send(ws, data));
}

function addClient(userId: string, ws: WebSocket) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(ws);
}

function removeClient(userId: string, ws: WebSocket) {
  const set = clients.get(userId);
  if (set) {
    set.delete(ws);
    if (set.size === 0) clients.delete(userId);
  }
}

export function initChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    // URL: /ws/chat?token=JWT
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (!token) {
      send(ws, { type: 'ERROR', message: 'token required' });
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

    const userId = payload.id as string;
    addClient(userId, ws);
    Logger.info(`Chat WS connected: ${payload.email}`);
    send(ws, { type: 'CONNECTED' });

    const convRepo = AppDataSource.getRepository(Conversation);
    const msgRepo = AppDataSource.getRepository(Message);
    const userRepo = AppDataSource.getRepository(User);

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // { type: 'SEND', conversationId, text }
        if (msg.type === 'SEND') {
          const { conversationId, text } = msg;
          if (!conversationId || !text || !text.trim()) return;

          const conv = await convRepo.findOne({ where: { id: conversationId } });
          if (!conv) {
            send(ws, { type: 'ERROR', message: 'Conversation not found' });
            return;
          }
          const isTenant = conv.tenantId === userId;
          const isOwner = conv.ownerId === userId;
          if (!isTenant && !isOwner) {
            send(ws, { type: 'ERROR', message: 'Unauthorized' });
            return;
          }

          // tenant must keep active access; owner replies freely
          if (isTenant) {
            const tenant = await userRepo.findOne({
              where: { id: userId },
              select: ['id', 'accessExpiresAt'],
            });
            if (!hasActiveAccess(tenant || {})) {
              send(ws, { type: 'ERROR', message: 'Active access required' });
              return;
            }
          }

          // persist
          const message = msgRepo.create({
            conversationId,
            senderId: userId,
            text: text.trim(),
          });
          await msgRepo.save(message);
          conv.lastMessage = text.trim().substring(0, 200);
          conv.lastMessageAt = new Date();
          await convRepo.save(conv);

          const recipientId = isTenant ? conv.ownerId : conv.tenantId;
          const payloadOut = {
            type: 'MESSAGE',
            conversationId,
            message: {
              id: message.id,
              senderId: userId,
              text: message.text,
              createdAt: message.createdAt,
            },
          };

          // echo to sender (confirms + syncs other devices), push to recipient
          pushToUser(userId, payloadOut);
          pushToUser(recipientId, payloadOut);
          Logger.info(`Chat message ${message.id} -> ${recipientId}`);
        }
      } catch (error) {
        Logger.error('Chat WS message error', error);
        send(ws, { type: 'ERROR', message: 'Invalid message format' });
      }
    });

    ws.on('close', () => {
      removeClient(userId, ws);
      Logger.info(`Chat WS disconnected: ${payload.email}`);
    });
    ws.on('error', (error) => {
      Logger.error('Chat WS error', error);
      removeClient(userId, ws);
    });
  });

  Logger.info('Chat WebSocket initialized at /ws/chat');
  return wss;
}