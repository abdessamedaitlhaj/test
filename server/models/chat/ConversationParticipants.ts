import { db } from "../../db/db.ts";
import { dbGet, dbRun } from "../dbHelpers.ts";

export const initiateConversationParticipantsTable = () => {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS conversation_participants (
            conversation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_read_message_id INTEGER DEFAULT NULL,
            PRIMARY KEY (conversation_id, user_id),
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `,
    (err) => {
      if (err) {
        console.error(
          "Error creating conversation_participants table:",
          err.message
        );
      } else {
        console.log("✅ Conversation_participants table ready");
      }
    }
  );
};

interface ConversationParticipantRow {
  conversation_id: number;
  user_id: string;
}

export const selectOneConversationParticipant = async (
  sender_id: string,
  receiver_id: string
): Promise<ConversationParticipantRow> => {
  try {
    const row = await dbGet<ConversationParticipantRow>(
      `
      SELECT cp.conversation_id
      FROM conversation_participants cp
      WHERE cp.user_id = ?
      AND cp.conversation_id IN (
          SELECT cp2.conversation_id
          FROM conversation_participants cp2
          WHERE cp2.user_id = ?
      )
      LIMIT 1;
      `,
      [sender_id, receiver_id]
    );
    return row;
  } catch (err: any) {
    throw err;
  }
};

interface InsertConversationParticipantResult {
  lastID: number;
  changes: number;
}

export const insertConversationParticipant = async (
  conversation_id: string,
  sender_id: string,
  receiver_id: string
): Promise<InsertConversationParticipantResult> => {
  try {
    const result = await dbRun(
      `
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?), (?, ?)
      `,
      [conversation_id, sender_id, conversation_id, receiver_id]
    );
    return result;
  } catch (err: any) {
    throw err;
  }
};

export const insertLastRead = async (
  conversationId: number,
  userId: number
) => {
  try {
    const row = await dbRun(
      `
    UPDATE conversation_participants
    SET last_read_message = ?
    WHERE conversation_id = ? AND user_id = ?
    `,
      [new Date().toISOString(), conversationId, userId]
    );
  } catch (err: any) {
    throw err;
  }
};
