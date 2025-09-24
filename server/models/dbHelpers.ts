import { db } from "../db/db.ts";

// modify data (insert, update, delete)
export const dbRun = (
  sql: string,
  params: any[] = []
): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(
      sql,
      params,
      function (
        this: { lastID: number; changes: number } | undefined,
        err: Error | null
      ) {
        if (err) {
          console.log("❌ dbRun error:", err);
          return reject(err);
        }
        const result = { lastID: this?.lastID || 0, changes: this?.changes || 0 };
        resolve(result);
      }
    );
  });
};

// get single row
export const dbGet = <T = any>(
  sql: string,
  params: any[] = []
): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: T) => {
      if (err) {
        console.log("❌ dbGet error:", err);
        return reject(err);
      }
      resolve(row);
    });
  });
};

// select data
export const dbAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: T[]) => {
      if (err) {
        console.log("❌ dbAll error:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
};