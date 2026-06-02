import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';
import { hasActiveAccess } from './SubscriptionController';

export class ChatController {
  private convRepo = AppDataSource.getRepository(Conversation);
  private msgRepo = AppDataSource.getRepository(Message);
  private userRepo = AppDataSource.getRepository(User);

  // POST /api/chat/conversations  body: { ownerId }
  // Tenant starts (or reopens) a thread with an owner. Requires active access.
  async createConversation(req: Request, res: Response) {
    try {
      const tenantId = req.user!.id;
      const { ownerId } = req.body;
      if (!ownerId) return sendError(res, 'ownerId is required', 400);
      if (ownerId === tenantId) return sendError(res, 'Cannot message yourself', 400);

      // gate: tenant must have active access
      const tenant = await this.userRepo.findOne({
        where: { id: tenantId },
        select: ['id', 'accessExpiresAt'],
      });
      if (!hasActiveAccess(tenant || {})) {
        return sendError(res, 'Active access required to start a conversation', 403);
      }

      const owner = await this.userRepo.findOne({ where: { id: ownerId } });
      if (!owner) return sendError(res, 'Owner not found', 404);

      const participantsKey = `${tenantId}:${ownerId}`;
      let conv = await this.convRepo.findOne({ where: { participantsKey } });
      if (!conv) {
        conv = this.convRepo.create({ participantsKey, tenantId, ownerId });
        await this.convRepo.save(conv);
        Logger.info(`Conversation created: ${conv.id}`);
      }

      return sendSuccess(res, 'Conversation ready', {
        id: conv.id,
        owner: { id: owner.id, name: `${owner.firstName} ${owner.lastName}`, phone: owner.phone ?? null },
      }, 201);
    } catch (error) {
      Logger.error('Create conversation error', error);
      return sendError(res, 'Failed to start conversation', 500);
    }
  }

  // GET /api/chat/conversations
  // Returns threads where the user is either tenant or owner.
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const convs = await this.convRepo
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.tenant', 'tenant')
        .leftJoinAndSelect('c.owner', 'owner')
        .where('c.tenantId = :userId OR c.ownerId = :userId', { userId })
        .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST')
        .getMany();

      const result = await Promise.all(convs.map(async (c) => {
        const isOwnerView = c.ownerId === userId;
        const other = isOwnerView ? c.tenant : c.owner;
        const unread = await this.msgRepo.count({
          where: { conversationId: c.id, isRead: false },
        }).then(async () => {
          // unread = messages in this conv, not by me, still unread
          return this.msgRepo
            .createQueryBuilder('m')
            .where('m.conversationId = :cid', { cid: c.id })
            .andWhere('m.senderId != :userId', { userId })
            .andWhere('m.isRead = false')
            .getCount();
        });
        return {
          id: c.id,
          otherUser: {
            id: other?.id,
            name: `${other?.firstName ?? ''} ${other?.lastName ?? ''}`.trim(),
            phone: other?.phone ?? null,
          },
          role: isOwnerView ? 'owner' : 'tenant',
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          unreadCount: unread,
        };
      }));

      return sendSuccess(res, 'Conversations fetched', result);
    } catch (error) {
      Logger.error('Get conversations error', error);
      return sendError(res, 'Failed to fetch conversations', 500);
    }
  }

  // GET /api/chat/conversations/:id/messages
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const conv = await this.convRepo.findOne({ where: { id } });
      if (!conv) return sendError(res, 'Conversation not found', 404);
      if (conv.tenantId !== userId && conv.ownerId !== userId) {
        return sendError(res, 'Unauthorized', 403);
      }

      const messages = await this.msgRepo.find({
        where: { conversationId: id },
        order: { createdAt: 'ASC' },
      });

      // mark messages from the other party as read
      await this.msgRepo
        .createQueryBuilder()
        .update(Message)
        .set({ isRead: true })
        .where('conversationId = :id AND senderId != :userId AND isRead = false', { id, userId })
        .execute();

      return sendSuccess(res, 'Messages fetched', messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        isMine: m.senderId === userId,
        createdAt: m.createdAt,
      })));
    } catch (error) {
      Logger.error('Get messages error', error);
      return sendError(res, 'Failed to fetch messages', 500);
    }
  }

  // POST /api/chat/conversations/:id/messages  body: { text }
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { text } = req.body;
      if (!text || !text.trim()) return sendError(res, 'Message text required', 400);

      const conv = await this.convRepo.findOne({ where: { id } });
      if (!conv) return sendError(res, 'Conversation not found', 404);
      const isTenant = conv.tenantId === userId;
      const isOwner = conv.ownerId === userId;
      if (!isTenant && !isOwner) return sendError(res, 'Unauthorized', 403);

      // tenant must keep active access to send; owner replies freely
      if (isTenant) {
        const tenant = await this.userRepo.findOne({
          where: { id: userId },
          select: ['id', 'accessExpiresAt'],
        });
        if (!hasActiveAccess(tenant || {})) {
          return sendError(res, 'Active access required to send messages', 403);
        }
      }

      const message = this.msgRepo.create({
        conversationId: id,
        senderId: userId,
        text: text.trim(),
      });
      await this.msgRepo.save(message);

      conv.lastMessage = text.trim().substring(0, 200);
      conv.lastMessageAt = new Date();
      await this.convRepo.save(conv);

      // (Stage 3: also push over WebSocket to the recipient here.)

      return sendSuccess(res, 'Message sent', {
        id: message.id,
        senderId: userId,
        text: message.text,
        isMine: true,
        createdAt: message.createdAt,
        recipientId: isTenant ? conv.ownerId : conv.tenantId,
      }, 201);
    } catch (error) {
      Logger.error('Send message error', error);
      return sendError(res, 'Failed to send message', 500);
    }
  }
}