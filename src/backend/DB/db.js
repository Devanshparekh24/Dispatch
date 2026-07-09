import { openDatabase } from 'react-native-sqlite-storage';
import MSSQL from 'react-native-mssql';

let activeConfig = null;

let sqliteDb = null;

const getSQLiteConnection = () => {
  if (sqliteDb) {
    return sqliteDb;
  }

  sqliteDb = openDatabase({ name: 'Dispatch.db', location: 'default' }, () => {
    console.log('Database Created Success');
  }, error => console.log('Database Created Error', error));

  if (sqliteDb && !sqliteDb.executeQuery) {
    sqliteDb.executeQuery = (query, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.transaction((tx) => {
          tx.executeSql(
            query,
            params,
            (tx, results) => {
              const rows = [];
              if (results && results.rows) {
                for (let i = 0; i < results.rows.length; i++) {
                  rows.push(results.rows.item(i));
                }
              }
              resolve(rows);
            },
            (txOrError, error) => {
              reject(error || txOrError);
            }
          );
        }, (txError) => {
          reject(txError);
        });
      });
    };
  }

  return sqliteDb;
};

// ---- MSSQL (remote) ----
const SERVERS = [
  { name: 'GTPL', host: '103.217.85.79' },
  { name: 'Jio', host: '136.232.118.110' },
  { name: 'Primary', host: 'pgserver' },
];

const makeConfig = (host) => ({
  server: host,
  database: 'SARP',
  username: 'sa',
  password: 'topface',
  port: 1433,
  timeout: 5,
});

const canConnect = async (config) => {
  try {
    await MSSQL.close().catch(() => { });
    const ok = await MSSQL.connect(config);
    if (ok) {
      await MSSQL.close().catch(() => { });
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

 const setMSSQLConnection = async () => {
  for (const { name, host } of SERVERS) {
    const config = makeConfig(host);
    if (await canConnect(config)) {
      activeConfig = config;
      await MSSQL.connect(config);
      console.log(`[DB] Connected via ${name} (${host})`);
      return;
    }
  }
  throw new Error('All MSSQL connections failed');
};

const isClosedError = (error) => {
  if (!error || !error.message) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('closed') || msg.includes('connection') || msg.includes('state') || msg.includes('invalid state');
};

const wrapper = {
  connect: (config) => MSSQL.connect(config),
  close: () => MSSQL.close(),
  executeQuery: async (query) => {
    try {
      return await MSSQL.executeQuery(query);
    } catch (error) {
      if (isClosedError(error)) {
        console.log('[DB] Connection closed error detected, resetting and retrying...', error);
        connectionPromise = null; // Reset connection promise
        await getMSSQLConnection(); // Reconnect
        return await MSSQL.executeQuery(query); // Retry
      }
      throw error;
    }
  },
  executeUpdate: async (query) => {
    try {
      return await MSSQL.executeUpdate(query);
    } catch (error) {
      if (isClosedError(error)) {
        console.log('[DB] Connection closed error detected, resetting and retrying...', error);
        connectionPromise = null; // Reset connection promise
        await getMSSQLConnection(); // Reconnect
        return await MSSQL.executeUpdate(query); // Retry
      }
      throw error;
    }
  }
};

let connectionPromise = null;

const getMSSQLConnection = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      if (!activeConfig) {
        await setMSSQLConnection();
      } else {
        try {
          await MSSQL.connect(activeConfig);
        } catch {
          await setMSSQLConnection();
        }
      }
      return wrapper;
    } catch (error) {
      connectionPromise = null; // Reset on failure so it can retry later
      throw error;
    }
  })();

  return connectionPromise;
};

export {
  getSQLiteConnection,
  setMSSQLConnection,
  getMSSQLConnection,
};