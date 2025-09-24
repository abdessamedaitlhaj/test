import { selectFriends } from "server/models/Friendships";

export const getMyFriends = async (request: any, reply: any) => {

    const userId = request.user_infos?.id;
    const limit = Number(request.query.limit || "20" as string);
    const offset = Number(request.query.offset || "0" as string);

    if (!userId) {
      console.log("User not authenticated - no userId");
      return reply.status(401).send({ error: "User not authenticated" });
    }

    try {
      const friends = await selectFriends(String(userId), limit, offset);
      return reply.status(200).send({ friends });
    } catch (error) {
      return reply.status(500).send({ error: error });
  }
};