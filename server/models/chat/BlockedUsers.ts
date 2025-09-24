import { db } from "../../db/db.ts";
import { dbGet, dbRun } from "../dbHelpers.ts";

export const initiateBlockedUsersTable = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS blocked_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blocked_user INTEGER,
      blocker_user INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (blocked_user) REFERENCES users(id),
      FOREIGN KEY (blocker_user) REFERENCES users(id)
    )`,
    (err) => {
      if (err)
        console.error("Error creating blocked_users table:", err.message);
      else console.log("✅ Blocked users table ready");
    }
  );
};

export const selectBlock = async (blocker_user: string, blocked_user: string): Promise<boolean> => {

  try {
    const row = await dbGet<{ id: string, }>(
      `
      SELECT id FROM blocked_users
      WHERE blocker_user = ? AND blocked_user = ?
    `,
      [blocker_user, blocked_user]
    );
    if (row) {
      return true;
    } else {
      return false;
    }
  } catch (err: any) {
    throw err;
  }
};

export const insertBlock = async (
  blocker_user: string,
  blocked_user: string,
): Promise<{ lastID: number, changes: number }> => {
  try {
    const result = await dbRun(
      `
      INSERT INTO blocked_users (blocker_user, blocked_user)
      VALUES (?, ?)
    `,
      [blocker_user, blocked_user]
    );
    return result;
  } catch (err: any) {
    throw err;
  }
}

export const deleteBlock = async (
  blocker_user: string,
  blocked_user: string,
): Promise<{ lastID: number, changes: number }> => {
  try {
    const result = await dbRun(
      `
      DELETE FROM blocked_users
      WHERE blocker_user = ? AND blocked_user = ?
    `,
      [blocker_user, blocked_user]
    );
    return result;
  } catch (err: any) {
    throw err;
  }
}
