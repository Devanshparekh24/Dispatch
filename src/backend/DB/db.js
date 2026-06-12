import { openDatabase } from 'react-native-sqlite-storage';
import MSSQL from 'react-native-mssql';

let connectionString = '';
let connectionConfig = null;

// ==========================================
// 1. SQLite Local Database Setup
// ==========================================

/**
 * Opens and returns the local SQLite database connection
 * @returns {Promise<any>} The SQLite database instance
 */
export const getSQLiteConnection = async () => {
  return openDatabase({ name: 'Dispatch.db', location: 'default' });
};

// ==========================================
// 2. MSSQL Remote Database Setup
// ==========================================

/**
 * Parses a standard C# style MSSQL connection string into a config object for react-native-mssql
 * @param {string} connString - The C# style connection string
 * @returns {object} The configuration object for react-native-mssql
 */
export const parseConnectionString = (connString) => {
  const parts = connString.split(';').reduce((acc, part) => {
    const indexOfEquals = part.indexOf('=');
    if (indexOfEquals !== -1) {
      const key = part.substring(0, indexOfEquals).trim().toLowerCase();
      const value = part.substring(indexOfEquals + 1).trim();
      acc[key] = value;
    }
    return acc;
  }, {});

  let server = parts['data source'] || '';
  let port = 1433; // Default port for Microsoft SQL Server

  // Handle cases where port is specified directly in the IP/host (e.g., "136.232.118.110,1433" or "136.232.118.110:1433")
  if (server.includes(',')) {
    const serverParts = server.split(',');
    server = serverParts[0].trim();
    port = parseInt(serverParts[1].trim(), 10) || 1433;
  } else if (server.includes(':')) {
    const serverParts = server.split(':');
    server = serverParts[0].trim();
    port = parseInt(serverParts[1].trim(), 10) || 1433;
  }

  return {
    server,
    database: parts['initial catalog'] || '',
    username: parts['user id'] || '',
    password: parts['password'] || '',
    port,
    timeout: 5,  // Connect timeout in seconds (short for fast failover checking)
  };
};

/**
 * Tests if an MSSQL connection can be established with the given configuration
 * @param {object} config - The react-native-mssql configuration object
 * @returns {Promise<boolean>} True if connection succeeds, false otherwise
 */
export const testMSSQLConnection = async (config) => {
  console.log(`[DB] Testing connection to server: ${config.server}:${config.port}...`);
  try {
    // Attempt to close any existing connection before testing a new one
    try {
      await MSSQL.close();
    } catch (e) {
      // Ignore errors if no connection was open
    }

    const connected = await MSSQL.connect(config);
    if (connected) {
      console.log(`[DB] Successfully connected to server: ${config.server}`);
      // Close connection immediately after a successful test to allow clean reconnection
      try {
        await MSSQL.close();
      } catch (e) {}
      return true;
    }
    console.log(`[DB] Connection failed/rejected for server: ${config.server}`);
    return false;
  } catch (error) {
    console.warn(`[DB] Connection error for server ${config.server}:`, error.message || error);
    return false;
  }
};

/**
 * Attempts to connect to MSSQL, trying the primary connection first, 
 * then falling back to backup connection options.
 */
export const setMSSQLConnection = async () => {
  try {
    // First try primary connection
   

    // If primary fails, try backup connection jio
    const conn1 = "Data Source=136.232.118.110;Initial Catalog=SARP;User ID=sa;Password=topface;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False;ConnectRetryCount=0";
    const config1 = parseConnectionString(conn1);
    if (await testMSSQLConnection(config1)) {
      connectionString = conn1;
      connectionConfig = config1;
      console.log("[DB] Using backup connection Jio (136.232.118.110)");
      await MSSQL.connect(config1); // Re-establish active connection
      return;
    }

    // If primary fails, try backup connection GTPL
    const conn2 = "Data Source=103.217.85.79;Initial Catalog=SARP;User ID=sa;Password=topface;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False;ConnectRetryCount=0";
    const config2 = parseConnectionString(conn2);
    if (await testMSSQLConnection(config2)) {
      connectionString = conn2;
      connectionConfig = config2;
      console.log("[DB] Using backup connection GTPL (103.217.85.79)");
      await MSSQL.connect(config2); // Re-establish active connection
      return;
    }


     const conn3 = "Data Source=pgserver;Initial Catalog=SARP;User ID=sa;Password=topface;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False;ConnectRetryCount=0";
    const config3 = parseConnectionString(conn3);
    if (await testMSSQLConnection(config3)) {
      connectionString = conn1;
      connectionConfig = config3;
      console.log("[DB] Using primary connection (pgserver)");
      await MSSQL.connect(config3); // Re-establish active connection
      return;
    }
    

    throw new Error("All MSSQL database connections failed to connect.");
  } catch (ex) {
    throw new Error("Error initializing MSSQL DB connection: " + ex.message);
  }
};

/**
 * Returns the active MSSQL connection. Initializes the connection if not already connected.
 * @returns {Promise<typeof MSSQL>} The active MSSQL module
 */
export const getMSSQLConnection = async () => {
  if (!connectionConfig) {
    await setMSSQLConnection();
  } else {
    // If we have an active config, ensure we are still connected
    try {
      await MSSQL.connect(connectionConfig);
    } catch (e) {
      // Re-establish/failover connection if the active connection dropped
      await setMSSQLConnection();
    }
  }
  return MSSQL;
};

export { connectionString, connectionConfig };