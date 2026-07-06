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
    const localQuery = `SELECT
                            AA.CustName,
                            AA.CustID,
                            AA.VehicleID,
                            SUM(AA.Qty) AS Total_Qty,
                            COUNT(distinct AA.ItemName) AS No_of_Items,
                            COUNT(AA.BarCode) AS Total_QR_Code,
                            (select OrderID
                             From Barcode_Data_Local as qq 
                             Where qq.CustID=AA.CustID) as orderID,
                            (select count(BarCode)
                             From Dis_Scaned_QR_Data_Local as qq 
                             Where qq.CustID=AA.CustID) as Scanned_QR_Code
                            FROM Barcode_Data_Local as AA
                            GROUP BY
                            AA.CustID,
                            AA.CustName,
                            AA.VehicleID;
                        `;

    const result = await localConnection.executeQuery(localQuery);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    return [];
  }
};

const getItemDataScannedInfo = async (CustID, VehicleID) => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `SELECT
                        aa.ItemName,
                        aa.ItemID,
                        COUNT(aa.BarCode) AS Total_Qty,
                        (
                            SELECT COUNT(oo.BarCode)
                            FROM Dis_Scaned_QR_Data_Local AS oo
                            WHERE oo.CustID = aa.CustID
                            AND oo.VehicleID = aa.VehicleID
                            AND oo.ItemID = aa.ItemID
                        ) AS Scanned_Qty
                    FROM Barcode_Data_Local AS aa
                    WHERE aa.CustID = ?
                    AND aa.VehicleID = ?
                    GROUP BY aa.ItemName,
                     aa.ItemID;`;
    const result = await localConnection.executeQuery(localQuery, [
      CustID,
      VehicleID,
    ]);
    if (Array.isArray(result)) {
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    return [];
  }
};

const getlocalBarCodeData = async () => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `select * From Barcode_Data_Local`;
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
    const localQuery = `SELECT ItemID FROM Barcode_Data_Local
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

const isItemQtyLimitReached = async (ItemID, CustID, VehicleID) => {
  try {
    let localConnection = getSQLiteConnection();

    // 1. Get total allowed quantity for this ItemID, customer, and vehicle
    const allowedQuery = `SELECT SUM(Qty) AS TotalQty, COUNT(1) AS RowCount FROM Barcode_Data_Local
                          WHERE ItemID = ? AND CustID = ? AND VehicleID = ?`;
    const allowedResult = await localConnection.executeQuery(allowedQuery, [
      ItemID,
      CustID,
      VehicleID,
    ]);

    let allowedQty = 0;
    if (allowedResult && allowedResult.length > 0) {
      const rowCount = allowedResult[0].RowCount || 0;
      const totalQty = allowedResult[0].TotalQty || 0;
      allowedQty = Math.max(rowCount, totalQty);
    }

    if (allowedQty === 0) {
      return true; // No quantity allowed
    }

    // 2. Get number of times this ItemID has already been scanned for this customer and vehicle
    const scannedQuery = `SELECT COUNT(1) AS Total FROM Dis_Scaned_QR_Data_Local
                          WHERE ItemID = ? AND CustID = ? AND VehicleID = ?`;
    const scannedResult = await localConnection.executeQuery(scannedQuery, [
      ItemID,
      CustID,
      VehicleID,
    ]);

    let scannedQty = 0;
    if (scannedResult && scannedResult.length > 0) {
      scannedQty = scannedResult[0].Total || 0;
    }

    return scannedQty >= allowedQty;
  } catch (error) {
    console.error('Error in isItemQtyLimitReached:', error);
    return true;
  }
};

const itemNotAssignToCustomer = async (ItemID, CustID, VehicleID) => {
  try {
    const localConnection = getSQLiteConnection();

    const query = `
      SELECT COUNT(*) AS Total
      FROM Barcode_Data_Local
      WHERE ItemID = ?
        AND CustID = ?
        AND VehicleID = ?
    `;

    const result = await localConnection.executeQuery(query, [
      ItemID,
      CustID,
      VehicleID,
    ]);

    return result[0].Total === 0;
  } catch (error) {
    console.error('Error:', error);
    return true;
  }
};

const isScanLimitReached = async (ItemID, CustID, VehicleID) => {
  try {
    const localConnection = getSQLiteConnection();

    const query = `
      SELECT
        (
          SELECT COUNT(*)
          FROM Barcode_Data_Local
          WHERE ItemID = ?
            AND CustID = ?
            AND VehicleID = ?
        ) AS TotalQRCode,

        (
          SELECT COUNT(*)
          FROM Dis_Scaned_QR_Data_Local
          WHERE ItemID = ?
            AND CustID = ?
            AND VehicleID = ?
        ) AS ScannedQRCode
    `;

    const result = await localConnection.executeQuery(query, [
      ItemID,
      CustID,
      VehicleID,
      ItemID,
      CustID,
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
  OrderID,
  CustID,
  VehicleID,
  BarCode,
  Latitude,
  Longitude,
  UserID,
  CreatedAt,
) => {
  try {
   // 1. Get ItemID
const ItemID = await getItemID(BarCode, VehicleID);
if (!ItemID) {
    throw new Error("Barcode not found.");
}

// 2. Duplicate barcode
const isExistBarcode = await isItemExist(BarCode);
if (isExistBarcode) {
    throw new Error("This barcode has already been scanned.");
}

// 3. Check item assignment
const notAssigned = await itemNotAssignToCustomer(
    ItemID,
    CustID,
    VehicleID
);

if (notAssigned) {
    throw new Error("This item is not assigned to the selected customer.");
}

// 4. Check scan limit
const isScanLimit = await isScanLimitReached(
    ItemID,
    CustID,
    VehicleID
);

if (isScanLimit) {
    throw new Error("All QR Codes for this item have already been scanned.");
}
    let localConnection = getSQLiteConnection();

    const localQuery = `INSERT INTO Dis_Scaned_QR_Data_Local (OrderID, ItemID, CustID, VehicleID, BarCode, Latitude, Longitude,UserID,CreatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?,?,?)`;

    await localConnection.executeQuery(localQuery, [
      OrderID,
      ItemID,
      CustID,
      VehicleID,
      BarCode,
      Latitude,
      Longitude,
      UserID,
      CreatedAt,
    ]);
    console.log('Dis_Scaned_QR_Data_Local table insert successfully');
  } catch (error) {
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
    const query = 'SELECT distinct VehicleID FROM  Barcode_Data_Local';
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

export {
  getlocalVechical,
  getlocalBarCodeData,
  getPartyName,
  insertLocalScanningQRData,
  getScannendData,
  getItemDataScannedInfo,
  getSelectVehileData,
};
