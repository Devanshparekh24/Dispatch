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

const isBarcodeExist = async (BarCode, CustID, VehicleID) => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `SELECT count(1) AS Total FROM Dis_Scaned_QR_Data_Local
                        WHERE TRIM(BarCode) = TRIM(?) AND CustID = ? AND VehicleID = ?`;
    const result = await localConnection.executeQuery(localQuery, [
      BarCode,
      CustID,
      VehicleID,
    ]);

    if (result && result.length > 0 && result[0].Total > 0) {
        return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in isBarcodeExist:", error);
    return false;
  }
};  




const isItemExist = async (BarCode, VehicleID) => {
  try {
    let localConnection = getSQLiteConnection();
    const localQuery = `SELECT count(ItemID) AS Total FROM Barcode_Data_Local
                        WHERE TRIM(BarCode) = TRIM(?) AND VehicleID = TRIM(?)`;
    const result = await localConnection.executeQuery(localQuery, [
      BarCode,
      VehicleID,
    ]);

    if (result && result.length > 0 && result[0].Total > 0) {
        return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in isBarcodeExist:", error);
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
) => {
  try {
    const isExistQRCode = await isBarcodeExist(BarCode, CustID, VehicleID);
    const itemData= await isItemExist(BarCode, VehicleID);
    if (isExistQRCode) {
      throw new Error('Barcode is Already Exist');
    }

    if (!itemData) {
      throw new Error('Item not Exist For this Customer');
    }

    let localConnection = getSQLiteConnection();
    const localQuery = `INSERT INTO Dis_Scaned_QR_Data_Local (OrderID,CustID,VehicleID,BarCode,Latitude,Longitude)
                            values(?,?,?,?,?,?)`;

    await localConnection.executeQuery(localQuery, [OrderID, CustID, VehicleID, BarCode, Latitude, Longitude]);
    console.log('Dis_Scaned_QR_Data_Local table insert successfully');
  } catch (error) {
    console.log("🚀 ~ insertLocalScanningQRData ~ error:", error.message);
    throw error; // Re-throw to propagate back to the React Query mutation and show UI Alert
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
    console.error("Error in getSelectVehileData:", error);
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
  getSelectVehileData
};
