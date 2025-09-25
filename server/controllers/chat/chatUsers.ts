import { selectChatUsers } from "server/models/Users";

export const getChatUsers = async (request: any, reply: any) => {
  const userId = request.user_infos?.id;
  const limit = Number(request.query.limit || "20" as string);
  const offset = Number(request.query.offset || "0" as string);

  if (!userId) {
    return reply.status(401).send({ error: "User not authenticated" });
  }

  try {
    const chatUsers = await selectChatUsers(String(userId), limit, offset);
    return reply.status(200).send({ chatUsers });
  } catch (error) {
    return reply.status(500).send({ error: "Failed to fetch chat users" });
  }
};
