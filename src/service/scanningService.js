import { getSQLiteConnection } from '../backend/DB/db';

const getlocalVechical = async () => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `select distinct VehicleID From Vechile_Master_Local`;
    const result = await localConnection.executeQuery(localQuery);

    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    return [];
  }
};
const getPartyName = async () => {
  try {
    let localConnection = getSQLiteConnection();

    const localQuery = `select 
                    aa.St_CustId,
                    aa.St_Name,
                    aa.VehicleID,
                    COUNT(DISTINCT aa.BarCode) as no_of_barcode,
                    COUNT(DISTINCT aa.BarCode) as Total_QR_Code,
                    (
                      SELECT GROUP_CONCAT(InvNo, ',')
                      FROM (
                          SELECT DISTINCT InvNo
                          FROM Dis_Barcode_Data_Local b
                          WHERE b.St_CustId = aa.St_CustId
                           AND b.VehicleID = aa.VehicleID
                      )
                  ) AS InvNo,
                     COUNT(DISTINCT aa.ItemID) as no_of_item,
                    sum(aa.BarCodeQty) as total_qty,
                    (select count(oo.BarCode)
                     from Dis_Scaned_QR_Data_Local as oo
                     where oo.St_CustID=aa.St_CustId and oo.VehicleID=aa.VehicleID) as scanned_qty,
                    (select count(oo.BarCode)
                     from Dis_Scaned_QR_Data_Local as oo
                     where oo.St_CustID=aa.St_CustId and oo.VehicleID=aa.VehicleID) as Scanned_QR_Code
                    FROM Dis_Barcode_Data_Local as aa
                    group by 
                        aa.St_CustId,
                        aa.St_Name,
                        aa.VehicleID`;

    const result = await localConnection.executeQuery(localQuery);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.error('Error in getPartyName:', error);
    return [];
  }
};

const getItemDataScannedInfo = async (CustID, VehicleID) => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `SELECT 
                          aa.ItemID,
                          aa.ItemName,
                          COUNT(aa.BarCode) AS no_of_Barcode,
                          (
                              SELECT COUNT(oo.BarCode)
                              FROM Dis_Scaned_QR_Data_Local AS oo
                              WHERE oo.St_CustID = aa.St_CustId
                                AND oo.VehicleID = aa.VehicleID
                                AND oo.ItemID = aa.ItemID
                          ) AS Scanned_Qty
                        FROM Dis_Barcode_Data_Local AS aa
                        WHERE aa.St_CustId = ?
                          AND aa.VehicleID = ?
                        GROUP BY aa.ItemID, aa.ItemName`;
    const result = await localConnection.executeQuery(localQuery, [
      CustID,
      VehicleID,
    ]);
    console.log('🚀 ~ getItemDataScannedInfo ~ result:', result);

    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.error('Error in getItemDataScannedInfo:', error);
    return [];
  }
};

const getlocalBarCodeData = async () => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `select * From Dis_Barcode_Data_Local`;
    const result = await localConnection.executeQuery(localQuery);

    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    return [];
  }
};

const isItemExist = async BarCode => {
  try {
    const localConnection = getSQLiteConnection();

    const query = `
      SELECT COUNT(*) AS Total
      FROM Dis_Scaned_QR_Data_Local
      WHERE TRIM(BarCode) = TRIM(?)
    `;

    const result = await localConnection.executeQuery(query, [BarCode]);

    return result[0].Total > 0;
  } catch (error) {
    console.error('Error in isItemExist:', error);
    return false;
  }
};

const getItemID = async (BarCode, VehicleID) => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `SELECT ItemID FROM Dis_Barcode_Data_Local
                        WHERE TRIM(BarCode) = TRIM(?)  AND VehicleID = ?`;
    const result = await localConnection.executeQuery(localQuery, [
      BarCode,
      VehicleID,
    ]);
    if (result && result.length > 0) {
      return result[0].ItemID;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in getItemID:', error);
    return null;
  }
};

const getDetails = async (BarCode) => {
  try {
    const localConnection = getSQLiteConnection();

    const query = `
                        SELECT 
                        OrderID,
                        ItemID,
                        St_CustId AS St_CustID,
                        Bt_CustId,
                        AgentId,
                        VehicleID,
                        InvId,
                        InvDate,
                        BarCode,
                        PackingTypeId,
                        PackingTypeName,
                        BarCodeQty,
                        ChallanQty,
                        TripID,
                        TripDate,
                        VehicleType
                        FROM Dis_Barcode_Data_Local
                        WHERE TRIM(BarCode) = TRIM(?)`;

    const result = await localConnection.executeQuery(query, [
      BarCode,
    ]);

    if (result && result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  } catch (error) {
    console.log('🚀 ~ getDetails ~ error:', error);
    return null;
  }
};

const itemNotAssignToCustomer = async (ItemID, St_CustID, VehicleID) => {
  try {
    const localConnection = getSQLiteConnection();

    const query = `
      SELECT COUNT(*) AS Total
      FROM Dis_Barcode_Data_Local
      WHERE ItemID = ?
        AND St_CustId = ?
        AND VehicleID = ?
    `;

    const result = await localConnection.executeQuery(query, [
      ItemID,
      St_CustID,
      VehicleID,
    ]);

    return result[0].Total === 0;
  } catch (error) {
    console.error('Error in itemNotAssignToCustomer:', error);
    return true;
  }
};

const isScanLimitReached = async (ItemID, St_CustID, VehicleID) => {
  try {
    const localConnection = getSQLiteConnection();

    const query = `
      SELECT
        (
          SELECT COUNT(*)
          FROM Dis_Barcode_Data_Local
          WHERE ItemID = ?
            AND St_CustId = ?
            AND VehicleID = ?
        ) AS TotalQRCode,

        (
          SELECT COUNT(*)
          FROM Dis_Scaned_QR_Data_Local
          WHERE ItemID = ?
            AND St_CustID = ?
            AND VehicleID = ?
        ) AS ScannedQRCode
    `;

    const result = await localConnection.executeQuery(query, [
      ItemID,
      St_CustID,
      VehicleID,
      ItemID,
      St_CustID,
      VehicleID,
    ]);

    if (result && result.length > 0) {
      const { TotalQRCode, ScannedQRCode } = result[0];

      return ScannedQRCode >= TotalQRCode;
    }

    return false;
  } catch (error) {
    console.error('Error in isScanLimitReached:', error);
    return false;
  }
};

const insertLocalScanningQRData = async (
  St_CustID,
  BarCode,
  Latitude,
  Longitude,
  UserID,
  CreatedAt,
) => {
  try {
    let localConnection = getSQLiteConnection();

    const barcodeDetails = await getDetails(BarCode);
    if (!barcodeDetails) {
      throw new Error('Barcode not found.');
    }

    const {
      OrderID,
      ItemID,
      Bt_CustId,
      AgentId,
      VehicleID,
      InvId,
      InvDate,
      PackingTypeId,
      PackingTypeName,
      BarCodeQty,
      ChallanQty,
      TripID,
      TripDate,
      VehicleType
    } = barcodeDetails;

    // 2. Duplicate barcode
    const isExistBarcode = await isItemExist(BarCode);
    if (isExistBarcode) {
      throw new Error('This barcode has already been scanned.');
    }

    // 3. Check item assignment
    const notAssigned = await itemNotAssignToCustomer(
      ItemID,
      St_CustID,
      VehicleID,
    );

    if (notAssigned) {
      throw new Error('This item is not assigned to the selected customer.');
    }

    // 4. Check scan limit
    const isScanLimit = await isScanLimitReached(ItemID, St_CustID, VehicleID);

    if (isScanLimit) {
      throw new Error('All QR Codes for this item have already been scanned.');
    }

    const localQuery = `
INSERT INTO Dis_Scaned_QR_Data_Local (
    OrderID,
    ItemID,
    St_CustID,
    Bt_CustId,
    AgentId,
    VehicleID,
    InvId,
    InvDate,
    BarCode,
    PackingTypeId,
    PackingTypeName,
    BarCodeQty,
    ChallanQty,
    TripID,
    TripDate,
    VehicleType,
    Latitude,
    Longitude,
    UserID,
    CreatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
`;

    await localConnection.executeQuery(localQuery, [
      OrderID,
      ItemID,
      St_CustID,
      Bt_CustId,
      AgentId,
      VehicleID,
      InvId,
      InvDate,
      BarCode,
      PackingTypeId,
      PackingTypeName,
      BarCodeQty,
      ChallanQty,
      TripID,
      TripDate,
      VehicleType,
      Latitude,
      Longitude,
      UserID,
      CreatedAt,
    ]);

    console.log('Dis_Scaned_QR_Data_Local inserted successfully');
  } catch (error) {
    if (
      error.message?.includes('SQLITE_CONSTRAINT_UNIQUE') ||
      error.message?.includes('UNIQUE constraint failed')
    ) {
      throw new Error('This barcode has already been scanned ✨✨✨✨✨.');
    }

    console.log('🚀 ~ insertLocalScanningQRData ~ error:', error.message);
    throw error;
  }
};

const getScannendData = async () => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `select * From Dis_Scaned_QR_Data_Local`;
    const result = await localConnection.executeQuery(localQuery);

    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    return [];
  }
};

const getSelectVehileData = async () => {
  try {
    const connection = await getSQLiteConnection();
    const query = 'SELECT distinct VehicleID FROM  Dis_Barcode_Data_Local';
    const result = await connection.executeQuery(query);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.error('Error in getSelectVehileData:', error);
    return [];
  }
};

const getTotalSyncData = async () => {
  try {
    const connection = await getSQLiteConnection();
    const query = `SELECT
        (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Scaned_QR_Data_Local
          WHERE IsSynced=0            
        ) AS TotalQRCode,

        (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Scaned_QR_Data_Local
          WHERE IsSynced=1          
        ) AS ScannedQRCode
    
    
    `;

    const result = await connection.executeQuery(query);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.log('🚀 ~ getTotalSyncData ~ error:', error);
  }
};

const getTotalBagData = async () => {
  try {
    const connection = await getSQLiteConnection();
    const query = `SELECT
        (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Barcode_Data_Local
        ) AS TotalBag,

        (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Scaned_QR_Data_Local
        ) AS TotalScannedBag,
        (
         (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Barcode_Data_Local
        ) - (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Scaned_QR_Data_Local
        )
        ) AS TotalPendingBag
    
    
    `;

    const result = await connection.executeQuery(query);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.log('🚀 ~ getTotalSyncData ~ error:', error);
  }
};

const getTotalScannedData = async () => {
  try {
    const connection = await getSQLiteConnection();
    const query = `SELECT
        (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Scaned_QR_Data_Local          
        ) AS TotalQRCode,
        (
          SELECT COUNT(Distinct BarCode)
          FROM Dis_Scaned_QR_Data_Local
          WHERE IsSynced=1          
        ) AS ScannedQRCode
    `;

    const result = await connection.executeQuery(query);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.log('🚀 ~ getTotalSyncData ~ error:', error);
  }
};

export {
  getlocalVechical,
  getlocalBarCodeData,
  getPartyName,
  insertLocalScanningQRData,
  getScannendData,
  getItemDataScannedInfo,
  getSelectVehileData,
  getTotalSyncData,
  getTotalScannedData,
  getTotalBagData,
};
