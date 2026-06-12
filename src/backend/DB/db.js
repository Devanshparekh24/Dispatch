import { openDatabase } from 'react-native-sqlite-storage';
import MSSQL from 'react-native-mssql';

let activeConfig = null;

// ---- SQLite (local) ----
export const getSQLiteConnection = () => {
  return openDatabase({ name: 'Dispatch.db', location: 'default' });
};

// ---- MSSQL (remote) ----
const SERVERS = [
  { name: 'Jio', host: '136.232.118.110' },
  { name: 'GTPL', host: '103.217.85.79' },
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

export const setMSSQLConnection = async () => {
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

export const getMSSQLConnection = async () => {
  if (!activeConfig) {
    await setMSSQLConnection();
  } else {
    try {
      await MSSQL.connect(activeConfig);
    } catch {
      await setMSSQLConnection();
    }
  }
  return MSSQL;
};

export {
  getSQLiteConnection,
  setMSSQLConnection,
  getMSSQLConnection,
};