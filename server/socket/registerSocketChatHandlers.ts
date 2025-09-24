import type { FastifyInstance } from "fastify";
import { createMessage } from "../controllers/chat/messages.ts"; // This is the only import needed for saving
import { db } from "../db/db.ts";

export const registerSocketChatHandlers = (
  app: FastifyInstance,
  socket: any
) => {
  socket.on("stop_typing", (data: { rid: string; sid: string }) =>
    app.io.to(String(data.rid)).emit("stop_typing", data.sid)
  );
  socket.on("istyping", (data: { rid: string; sid: string }) =>
    app.io.to(String(data.rid)).emit("typing", data.sid)
  );

  socket.on(
    "accept_friend_request",
    (data: { userId: string; friendId: string }) => {
      const userId = data.userId;
      const friendId = data.friendId;
      const authenticatedUserId = (socket as any).userId;

      if (String(authenticatedUserId) !== String(userId)) {
        app.log.warn(
          `🚫 User ${authenticatedUserId} tried to accept friend request as ${userId}`
        );
        socket.emit("error", "Cannot accept friend requests as another user");
        return;
      }

      app.io.to(String(userId)).emit("friend_request_accepted");
      app.io.to(String(friendId)).emit("friend_request_accepted");
    }
  );

  socket.on("unblock_user", (userId: string) => {
    // optionally will notify the unblocked user
    const authenticatedUserId = (socket as any).userId;
  });

  socket.on("block_user", (userId: string) => {
    // optionally will notify the blocked user
    const authenticatedUserId = (socket as any).userId;
  });

  // socket.on(
  //   "unreadCounts",
  //   async (data: { selectedId: string; data: Record<string, number> }) => {
  //     console.log("unreadCounts event received with data:", data);
  //     app.io.to(String(data.selectedId)).emit("unreadCounts", data.data);
  //   }
  // );

  socket.on(
    "send_message",
    async (payload: {
      sender_id: string;
      receiver_id: string;
      content: string;
    }) => {
      const senderId = payload.sender_id;
      const receiverId = payload.receiver_id;
      const authenticatedUserId = (socket as any).userId;

      if (authenticatedUserId !== senderId) {
        app.log.warn(
          `🚫 User ${authenticatedUserId} tried to send message as ${senderId}`
        );
        socket.emit("error", "Cannot send messages as another user");
        return;
      }

      if (!payload.content || typeof payload.content !== "string") {
        socket.emit("error", "Message content is required");
        return;
      }

      if (payload.content.length > 1000) {
        socket.emit("error", "Message too long (max 1000 characters)");
        return;
      }

      try {
        const newMessage = await createMessage({
          sender_id: Number(senderId),
          receiver_id: Number(receiverId),
          content: payload.content,
        });
        app.io.to(senderId).emit("receive_message", newMessage);
        app.io.to(String(receiverId)).emit("receive_message", newMessage);
      } catch (e: any) {
        socket.emit("error", `Failed to send message: ${e.message}`);
      }
    }
  );
};
