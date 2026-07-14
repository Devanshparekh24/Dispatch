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
          console.log(
            '🚀 ~ createUserMasterTable ~ error:',
            error || txOrError,
          );
        },
      );
    });
  } catch (error) {
    console.log('🚀 ~ createUserMasterTable ~ error:', error);

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
          console.log('🚀 ~ createVechileMaster ~ error:', error || txOrError);
        },
      );
    });
  } catch (error) {
    console.log('🚀 ~ createVechileMaster ~ error:', error);
    throw error;
  }
};

const createBarcodeDatatTable = async () => {
  try {
    const Localconnection = await getSQLiteConnection();

    const query = `
     CREATE TABLE IF NOT EXISTS Dis_Barcode_Data_Local (
     ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TripID	INTEGER,
      TripDate	TEXT,
      VehicleType	TEXT,
      VehicleID	TEXT,
      InvId	INTEGER,
      InvNo	TEXT,
      InvDate	TEXT,
      AgentId	INTEGER,
      AgentName	TEXT,
      Bt_CustId	INTEGER,
      Bt_Name	TEXT,
      St_CustId	INTEGER,
      St_Name	TEXT,
      OrderID	TEXT,
      ChallanId	INTEGER,
      ChallanNo	TEXT,
      ChallanDate	TEXT,
      ItemID	INTEGER,
      ItemName	TEXT,
      ChallanQty	INTEGER,
      PackingTypeId	INTEGER,
      PackingTypeName	TEXT,
      BarcodeId	INTEGER,
      BarCode	TEXT,
      BarCodeQty	REAL,
      Latitude TEXT,
      Longitude TEXT
)
   
    `;

    Localconnection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('Dis_Barcode_Data_Local table created successfully');
        },
        (txOrError, error) => {
          console.log(
            '🚀 ~ createBarcodeDatatTable ~ error:',
            error || txOrError,
          );
        },
      );
    });
  } catch (error) {
    console.log('🚀 ~ createBarcodeDatatTable ~ error:', error);
    throw error;
  }
};

const createScaningQRDatatTable = async () => {
  try {
    const Localconnection = await getSQLiteConnection();
    const query = `
    CREATE TABLE IF NOT EXISTS Dis_Scaned_QR_Data_Local (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    OrderID TEXT,
    ItemID INTEGER,
    St_CustID INTEGER,
    Bt_CustId	INTEGER,
    AgentId	INTEGER,
    VehicleID TEXT,
    InvId	INTEGER,
    InvDate	TEXT,
    BarCode   TEXT UNIQUE,
    PackingTypeId	INTEGER,
    PackingTypeName	TEXT,
    BarCodeQty	REAL,
    ChallanQty	INTEGER,
    TripID	INTEGER,
    TripDate	TEXT,
    VehicleType	TEXT,
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
          console.log(
            '🚀 ~ createScaningQRDatatTable ~ error:',
            error || txOrError,
          );
        },
      );
    });
  } catch (error) {
    console.log('🚀 ~ createScaningQRDatatTable ~ error:', error);
    throw error;
  }
};
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
          console.log(
            '🚀 ~ createScaningQRDatatTable ~ error:',
            error || txOrError,
          );
        },
      );
    });
  } catch (error) {
    console.log('🚀 ~ createScaningQRDatatTable ~ error:', error);
    throw error;
  }
};

const initTable = async () => {
  try {
    await createUserMasterTable();
    await createVechileMaster();
    await createBarcodeDatatTable();
    await createScaningQRDatatTable();
    await customErrorLog();
  } catch (error) {
    console.log('🚀 ~ initTable ~ error:', error);
  }
};

export default initTable;
