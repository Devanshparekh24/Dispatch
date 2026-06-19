import { getSQLiteConnection } from '../backend/DB/db';

// Generic transaction wrapper
export const runTransaction = async (callback) => {
  try {
    const db = await getSQLiteConnection();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        callback(tx, resolve, reject);
      });
    });

  } catch (error) {
    console.log("Transaction Error:", error?.message || error);
    throw error;
  }
};