import { FastifyReply, FastifyRequest } from "fastify";
import { deleteBlock, insertBlock, selectBlock } from "server/models/chat/BlockedUsers";
import { removeFriendship } from "server/models/Friendships";
import { FindById } from "server/models/Users";

export const blockUser = async (
  request: FastifyRequest<{ Params: { userId: string; blockUserId: string } }>,
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
  if (String(authenticatedUserId) === String(userId)) {
    return reply.status(400).send({ error: "You cannot block yourself" });
  }

  try {
    const blockUser = await FindById(userId);
    if (!blockUser) {
      return reply.status(404).send({ error: "This user doesn't exist" });
    }
        const existingBlock = await selectBlock(
      String(authenticatedUserId),
      String(userId)
    );
      if (existingBlock) {
        return reply.status(400).send({ error: "User is already blocked" });
      }

      await insertBlock(
      String(authenticatedUserId),
      String(userId)
    );
    // may be
    // await removeFriendship(String(authenticatedUserId), String(userId));

  } catch (error) {
    return reply.status(500).send({ error: error });
  }

  return reply.status(200).send({ success: true });
};

export const isBlocked = async (
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

  if (String(authenticatedUserId) === String(userId)) {
    return reply
      .status(400)
      .send({ error: "You cannot check block status for yourself" });
  }

  try {
    const blockUser = await FindById(userId);
    if (!blockUser) {
      return reply.status(404).send({ error: "This user doesn't exist" });
    }
  } catch (error) {
    return reply.status(500).send({ error: "Failed to verify user existence" });
  }

  try {
    const blockRecord = await selectBlock(
      String(authenticatedUserId),
      String(userId)
    );

    if (!blockRecord) {
      return reply.status(200).send({ blocked: false });
    } else {
      return reply.status(200).send({ blocked: true });
    }
  } catch (error) {
    return reply.status(500).send({ error: "dasdas" });
  }
};

export const isBlockedReverse = async (
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

  if (String(authenticatedUserId) === String(userId)) {
    return reply
      .status(400)
      .send({ error: "You cannot check block status for yourself" });
  }

  try {
    const blockUser = await FindById(userId);
    if (!blockUser) {
      return reply.status(404).send({ error: "This user doesn't exist" });
    }
  } catch (error) {
    return reply.status(500).send({ error: "Failed to verify user existence" });
  }

  try {
    const blockRecord = await selectBlock(
      String(userId),
      String(authenticatedUserId)
    );

    if (!blockRecord) {
      return reply.status(200).send({ blocked: false });
    } else {
      return reply.status(200).send({ blocked: true });
    }
  } catch (error) {
    return reply.status(500).send({ error: "dasdas" });
  }
};

export const unblockUser = async (
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

  if (String(authenticatedUserId) === String(userId)) {
    return reply.status(400).send({ error: "You cannot unblock yourself" });
  }

  const blockUser = await FindById(userId);

  if (!blockUser) {
    return reply.status(404).send({ error: "This user doesn't exist" });
  }
  const existingBlock = await selectBlock(
    String(authenticatedUserId),
    String(userId)
  );

  if (!existingBlock) {
    return reply.status(400).send({ error: "User is not blocked" });
  }

  try {
    await deleteBlock(
      String(authenticatedUserId),
      String(userId)
    );
  } catch (error) {
    return reply.status(500).send({ error: error });
  }

  return reply.status(200).send({ success: true });
};
