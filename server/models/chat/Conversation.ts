import { send } from "vite";
import { db } from "../../db/db.ts";
import { dbAll, dbRun } from "../dbHelpers.ts";

export const initiateConversationTable = () => {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS conversations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
    (err) => {
      if (err) {
        console.error("Error creating conversations table:", err.message);
      } else {
        console.log("✅ Conversations table ready");
      }
    }
  );
};

interface Conversation {
  id: number;
  timestamp: string;
}

export const insertConversation = async (): Promise<Conversation> => {
  const result = await dbRun(
    `
        INSERT INTO conversations DEFAULT VALUES
      `
  );
  return {
    id: result.lastID,
    timestamp: new Date().toISOString(),
  };
};

interface ConversationMessages {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  avatarurl: string;
  conversation_id: number;
}

export const selectOneConversation = async (
  sender_id: string,
  receiver_id: string,
  limit: number,
  offset: number
): Promise<ConversationMessages[]> => {
  try {

    const messages = await dbAll<ConversationMessages>(
      `
        SELECT m.id, m.sender_id, m.receiver_id, m.content, m.timestamp, u.avatarurl, m.conversation_id
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp ASC
        LIMIT ? OFFSET ?;
      `,
      [sender_id, receiver_id, receiver_id, sender_id, limit, offset]
    );
    return messages;
  } catch (err: any) {
    throw err;
  }
};
