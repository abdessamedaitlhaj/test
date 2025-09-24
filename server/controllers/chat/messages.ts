import { FastifyRequest, FastifyReply } from "fastify";
import { insertMessage, selectAllMessages } from "server/models/chat/Message";
import {
  insertConversationParticipant,
  insertLastRead,
  selectOneConversationParticipant,
} from "server/models/chat/ConversationParticipants";
import {
  insertConversation,
  selectOneConversation,
} from "server/models/chat/Conversation";
import { FindById } from "server/models/Users";
import { insertUnreadCount } from "server/models/chat/UnreadMessages";
import { dbAll } from "server/models/dbHelpers";

export const getMessages = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = request.user_infos?.id;
    if (!userId) {
      return reply.status(401).send({ error: "User not authenticated" });
    }

    const messages = await selectAllMessages(userId);
    return { messages };
  } catch (error) {
    reply.status(500).send({ error });
  }
};

interface SaveMessageParams {
  sender_id: number;
  receiver_id: number;
  content: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  avatarurl: string;
  timestamp: string;
  conversation_id: number;
}

export async function createMessage(
  params: SaveMessageParams
): Promise<Message> {
  const { sender_id, receiver_id, content } = params;

  if (!sender_id || !receiver_id || !content) {
    throw new Error("Missing required fields for message creation.");
  }

  try {
    const existingConversation = await selectOneConversationParticipant(
      String(sender_id),
      String(receiver_id)
    );

    let conversationId: number;

    if (!existingConversation) {
      const conversationResult = await insertConversation();
      conversationId = conversationResult.id;

      await insertConversationParticipant(
        String(conversationId),
        String(sender_id),
        String(receiver_id)
      );
    } else {
      conversationId = existingConversation.conversation_id;
    }
    const timestamp = new Date().toISOString();

    const messageResult = await insertMessage(
      sender_id,
      receiver_id,
      content,
      conversationId,
    );
    const senderUser = await FindById(String(sender_id));
    const newMessage: Message = {
      id: messageResult.lastID,
      sender_id,
      receiver_id,
      content,
      avatarurl: senderUser?.avatarurl,
      timestamp,
      conversation_id: conversationId,
    };

    return newMessage;
  } catch (err: any) {
    throw err;
  }
}

interface ConversationParams {
  userId: number;
  otherUserId: number;
}

export const getConversation = async (
  request: FastifyRequest<{
    Params: ConversationParams  }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;
  const authenticatedUserId = request.user_infos?.id;
  const limit = Number(request.query.limit as string);
  const offset = Number(request.query.offset as string);

  if (!userId) {
    return reply.status(400).send({ error: "Missing user IDs" });
  }

  if (!authenticatedUserId) {
    return reply.status(401).send({ error: "User not authenticated" });
  }

  try {
    const existingUser = await FindById(String(userId));
    if (!existingUser) {
      return reply.status(404).send({ error: "User not found" });
    }

    const messages = await selectOneConversation(
      String(userId),
      String(authenticatedUserId),
      limit,
      offset
    );

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      avatarurl: msg.avatarurl,
      content: msg.content,
      timestamp: msg.timestamp,
      conversation_id: msg.conversation_id,
    }));
    
    return reply.status(200).send({ conversation: formattedMessages });
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch conversation" });
  }
};

export const incrementUnreadCount = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;
  const authenticatedUserId = request.user_infos?.id;

  if (!userId) {
    return reply.status(400).send({ error: "Missing user ID" });
  }

  if (!authenticatedUserId) {
    return reply.status(401).send({ error: "User not authenticated" });
  }

  try {
    await insertUnreadCount(userId);
    reply.status(200).send({ message: "Unread count incremented" });
  } catch (error) {
    reply.status(500).send({ error: "Failed to increment unread count" });
  }
};

export const addLastRead = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { conversationId, userId } = request.params as {
    conversationId: string;
    userId: string;
  };
      console.log("Adding last read for conversation:", conversationId, "user:", userId);
      console.log("Adding last read for conversation:", conversationId, "user:", userId);
      console.log("Adding last read for conversation:", conversationId, "user:", userId);

  try {
    const row = await insertLastRead(Number(conversationId), Number(userId));
  } catch (err: any) {
    throw err;
  }
};
