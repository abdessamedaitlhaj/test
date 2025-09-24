import { send } from "vite";
import { db } from "../../db/db.ts";
import { dbAll, dbRun } from "../dbHelpers.ts";

export const initiateUnreadMessagesTable = () => {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS unread_messages (
          user_id INTEGER PRIMARY KEY,
          count INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `,
    (err) => {
      if (err) {
        console.error("Error creating unread_messages table:", err.message);
      } else {
        console.log("✅ UnreadMessages table ready");
      }
    }
  );
}

interface UnreadMessages {
  user_id: number;
  count: number;
}

export const getUnreadCount = async (user_id: string): Promise<number> => {
  try {
    const row = await dbAll<UnreadMessages>(
      `
        SELECT count FROM unread_messages WHERE user_id = ?
      `,
      [user_id]
    );
    if (row.length > 0) {
      return row[0].count;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

export const insertUnreadCount = async (user_id: string): Promise<void> => {
  try {
    await dbRun(
      `
        INSERT INTO unread_messages (user_id, count)
        VALUES (?, 1)
        ON CONFLICT(user_id) DO UPDATE SET count = count + 1
      `,
      [user_id]
    );
  } catch (error) {
    console.error("Error incrementing unread count:", error);
  }
};

export const resetUnreadCount = async (user_id: string): Promise<void> => {
  try {
    await dbRun(
      `
        UPDATE unread_messages SET count = 0 WHERE user_id = ?
      `,
      [user_id]
    );
  } catch (error) {
    console.error("Error resetting unread count:", error);
  }
};