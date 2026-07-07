import { getSQLiteConnection } from '../backend/DB/db';

const createUserMasterTable = async () => {
  try {
    const connection = await getSQLiteConnection();

    const query = `
      CREATE TABLE IF NOT EXISTS User_Local (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Mobile TEXT UNIQUE,
        Password TEXT,
        UserName Text,
        UserID INTEGER
      )
    `;

    connection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('User_Local table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createUserMasterTable ~ error:", error || txOrError)
        }
      );
    });

  } catch (error) {
    console.log("🚀 ~ createUserMasterTable ~ error:", error)

    throw error;
  }
};

const createVechileMaster = async () => {
  try {

    const Localconnection = await getSQLiteConnection();

    const query = `
      CREATE TABLE IF NOT EXISTS Vechile_Master_Local (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        VehicleID TEXT 
      )
    `;

    Localconnection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('Vechile_Master_Local table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createVechileMaster ~ error:", error || txOrError)
        }
      );
    });
  } catch (error) {
    console.log("🚀 ~ createVechileMaster ~ error:", error)
    throw error;
  }
}


const createBarcodeDatatTable = async () => {
  try {

    const Localconnection = await getSQLiteConnection();
    const query = `
     CREATE TABLE IF NOT EXISTS Barcode_Data_Local (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID TEXT,
    BarCode  TEXT UNIQUE,
    VehicleID TEXT,
    EInvoice_Number TEXT,
    CustID INTEGER,
    Qty  REAL,
    ItemID INTEGER,
    ItemName TEXT,
    CustName TEXT,
    UserID INTEGER,
    AndroidID TEXT,
    IsSynced INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

    Localconnection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('Barcode_Data_Local table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createBarcodeDatatTable ~ error:", error || txOrError)
        }
      );
    });
  } catch (error) {
    console.log("🚀 ~ createBarcodeDatatTable ~ error:", error)
    throw error;
  }
}

const createScaningQRDatatTable = async () => {
  try {

    const Localconnection = await getSQLiteConnection();
    const query = `
    CREATE TABLE IF NOT EXISTS Dis_Scaned_QR_Data_Local (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID TEXT,
    ItemID INTEGER,
    CustID INTEGER,
    VehicleID TEXT,
    EInvoice_Number TEXT,
    BarCode   TEXT UNIQUE,
    Latitude REAL,
    Longitude REAL,
    UserID INTEGER,
    IsSynced INTEGER DEFAULT 0,
    CreatedAt TEXT
  )
`;

    Localconnection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('Scaning_QR_Data_Local table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createScaningQRDatatTable ~ error:", error || txOrError)
        }
      );
    });
  } catch (error) {
    console.log("🚀 ~ createScaningQRDatatTable ~ error:", error)
    throw error;
  }
}
const customErrorLog = async () => {
  try {

    const Localconnection = await getSQLiteConnection();
    const query = `
     CREATE TABLE IF NOT EXISTS Dis_Error_Log (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    ErrorType TEXT,
    ErrorMessage TEXT,
    Screen Text,
    CreatedAt Text
  )
`;

    Localconnection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('Dis_Error_Log table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createScaningQRDatatTable ~ error:", error || txOrError)
        }
      );
    });
  } catch (error) {
    console.log("🚀 ~ createScaningQRDatatTable ~ error:", error)
    throw error;
  }
}


const initTable = async () => {
  try {
    await createUserMasterTable();
    await createVechileMaster();
    await createBarcodeDatatTable();
    await createScaningQRDatatTable();
  } catch (error) {
    console.log("🚀 ~ initTable ~ error:", error)

  }
}

export default initTable;