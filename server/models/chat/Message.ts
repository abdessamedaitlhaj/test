import { db } from "../../db/db.ts";
import { dbAll, dbRun } from "../dbHelpers.ts";

interface Message {
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp?: string;
}

export const initiateMessageTable = () => {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          conversation_id INTEGER,
          sender_id INTEGER NOT NULL,
          receiver_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id),
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
      `,
    (err) => {
      if (err) {
        console.error("Error creating posts table:", err.message);
      } else {
        console.log("✅ Messages ready");
      }
    }
  );
};

export const selectAllMessages = async (userId: string) => {
  try {
    const rows = await dbAll<Message>(
      `
      SELECT * FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY timestamp DESC
    `,
      [userId, userId]
    );
    return rows;
  } catch (err: any) {
    throw err;
  }
};

export const insertMessage = async (
  sender_id: number,
  receiver_id: number,
  content: string,
  conversationId: number
): Promise<{ lastID: number; changes: number }> => {
  try {
    const messageResult = await dbRun(
      `
      INSERT INTO messages (sender_id, receiver_id, content, timestamp, conversation_id)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        sender_id,
        receiver_id,
        content,
        new Date().toISOString(),
        conversationId,
      ]
    );

    return messageResult;
  } catch (err: any) {
    throw err;
  }
};

// export const selectAllMessagesFromAUser = async (
//   userId: string,
//   otherUserId: string
// ): Promise<Message[]> => {
//   try {
//     const rows = await dbAll<Message>(
//       `
//       SELECT * FROM messages
//       WHERE sender_id = ? OR receiver_id = ?
//       ORDER BY timestamp DESC
//     `,
//       [userId, userId]
//     );
//     return rows;
//   } catch (err: any) {
//     throw err;
//   }
