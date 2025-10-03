import type { FastifyInstance } from "fastify";
import { getChatUsers } from "../controllers/chat/chatUsers.ts";
import { getOnlineFriends } from "../controllers/friends.ts";
import { verifyToken } from "server/middleware/verifyToken.ts";
import {
  createMessage,
  getMessages,
  getConversation,
  addLastRead,
  deleteChat
} from "../controllers/chat/messages.ts";
import {
  blockUser,
  isBlocked,
  unblockUser,
  isBlockedReverse,
} from "../controllers/chat/blocks.ts";
import { searchChatUsers } from "server/controllers/users.ts";

export async function ChatRoutes(fastify: FastifyInstance) {
    fastify.delete("/chat/:userId", { preHandler: verifyToken }, deleteChat);
  fastify.get("/messages", { preHandler: verifyToken }, getMessages);
  fastify.post("/messages", { preHandler: verifyToken }, createMessage);
  fastify.get(
    "/messages/conversation/:userId",
    { preHandler: verifyToken },
    getConversation
  );
  fastify.post(
    "/messages/unreadCount/:conversationId/:userId",
    { preHandler: verifyToken },
    addLastRead
  );
  fastify.get("/users/chatUsers", { preHandler: verifyToken }, getChatUsers);
  fastify.get("/users/friends", { preHandler: verifyToken }, getOnlineFriends);
  fastify.get("/users/block/:userId", { preHandler: verifyToken }, isBlocked);
  fastify.get(
    "/users/blockReverse/:userId",
    { preHandler: verifyToken },
    isBlockedReverse
  );
  fastify.get("/users/searchChatUsers", { preHandler: verifyToken }, searchChatUsers);
  fastify.post("/users/block/:userId", { preHandler: verifyToken }, blockUser);
  fastify.post(
    "/users/unblock/:userId",
    { preHandler: verifyToken },
    unblockUser
  );
}
