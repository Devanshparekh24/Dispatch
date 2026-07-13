import { Alert } from 'react-native';
import { getSQLiteConnection, getMSSQLConnection } from '../backend/DB/db';
import isInternet from '../utils/network';
import { isEmpty } from '../utils/validation';

let localConnection = getSQLiteConnection();

const syncVechileTable = async () => {
  try {
    const connect = await isInternet();
    if (!connect) {
      console.log('Internet Is not connected .....');
      return;
    }

    const mssqlConn = await getMSSQLConnection();

    const serverquery = `Select Tm.VehicleID 
                          From Trip_Master_New As Tm With(Nolock)  
                          Inner Join Trip_Detail_New As Td With(Nolock) On Td.TripID=Tm.TripID  
                          Inner Join SaleChallan_New As Sc With(Nolock) On Sc.OrderID=Td.OrderID  
                          Inner Join SaleChallanDetails_New As Sd With(Nolock) On Sd.ChallanMasterID=Sc.AutoID  
                          Left Join  
                          (Select ChallanDetailId,COUNT(BarCode) As NoOfBarcode From WH_SaleChallanBarcode With(Nolock) Group By ChallanDetailId  
                          ) As Sb On Sb.ChallanDetailId=Sd.AutoID  
                          Where IsNull(Sc.Cancel_Flag,0)=0 And Sc.DeliveryArrangedBy=4498  
                          And Sc.ChallanDate=Convert(date,GetDate())  
                          Group By Tm.VehicleID  
                          Having Convert(int,Sum(Sd.Pcs))=Sum(IsNull(Sb.NoOfBarcode,0)) `;
    const result = await mssqlConn.executeQuery(serverquery);

    if (!result || result.length === 0) {
      console.log('No vehicle data found on remote server.');
      return;
    }

    await localConnection.transaction(tx => {
      // Optional: clear old data
      tx.executeSql('DELETE FROM Vechile_Master_Local');

      result.forEach(item => {
        tx.executeSql(
          'INSERT OR REPLACE INTO Vechile_Master_Local (VehicleID) VALUES (?)',
          [item.VehicleID],
        );
      });
    });

    console.log('Vehicle sync completed 🔥🔥🔥');
  } catch (error) {}
};

const updateTripMaster = async (vehicleID, androidID, userID) => {
  try {
    const mssqlConn = await getMSSQLConnection();

    const query = `
            UPDATE Trip_Master_New
            SET
                AndroidID = '${androidID}',
                UserID = '${userID}'
            WHERE
                VehicleID = '${vehicleID}'
                AND CAST(TDate AS DATE) = CAST(GETDATE() AS DATE)
        `;

    const result = await mssqlConn.executeUpdate(query);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const existVehileFetch = async vehicleID => {
  try {
    const connect = await isInternet();
    if (!connect) {
      console.log('Internet Is not connected .....');
      return;
    }
    const mssqlConn = await getMSSQLConnection();
    if (isEmpty(vehicleID)) {
      console.log('Vehicle not selected...');
      throw new Error('Vehicle not selected...');
    }
    const serverquery = `
                            select UserName From User_Master as um
                            where um.UserID in (select UserID from Dis_vw_BarCodeData where  VehicleID= '${vehicleID}')`;

    const result = await mssqlConn.executeQuery(serverquery);

    if (result.length > 0) {
      return result[0].UserName;
    } else {
      return null;
    }
  } catch (error) {}
};

const isVehicleChangeAllowed = async () => {
  try {
    const localConnection = await getSQLiteConnection();

    const query = `
      SELECT
        (
          SELECT COUNT(DISTINCT BarCode)
          FROM Dis_Barcode_Data_Local
        ) AS TotalsyncQRCode,

        (
         SELECT COUNT(DISTINCT BarCode)
          FROM Dis_Scaned_QR_Data_Local
          WHERE IsSynced=1
        ) AS TotalScannedQRCode
    `;

    const result = await localConnection.executeQuery(query);

    if (result.length > 0) {
      const { TotalsyncQRCode, TotalScannedQRCode } = result[0];

      if (TotalScannedQRCode === 0) {
        return true;
      }
      return TotalScannedQRCode === TotalsyncQRCode;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const barcodeDataSync = async (vehicleID, androidID, userID) => {
  try {
    const canChangeVehicle = await isVehicleChangeAllowed();

    if (!canChangeVehicle) {
      throw new Error('Please sync all bags before changing the vehicle.');
    }

    const existingUser = await existVehileFetch(vehicleID);

    if (existingUser) {
      throw new Error(`This vehicle is already assigned to ${existingUser}.`);
    }
    const connect = await isInternet();
    if (!connect) {
      console.log('Internet Is not connected .....');
      return;
    }
    const mssqlConn = await getMSSQLConnection();
    if (isEmpty(vehicleID)) {
      console.log('Vehicle not selected...');
      throw new Error('Vehicle not selected...');
    }
    const serverquery = `select * From Dis_vw_BarCodeData where 
     CAST(InvDate as date)=cast(GETDATE() as date) and  
    VehicleID = '${vehicleID}'`;

    const result = await mssqlConn.executeQuery(serverquery);
    if (!result || result.length === 0) {
      console.log('No vehicle data found on remote server.');
      return;
    }

    await updateTripMaster(vehicleID, androidID, userID);

    await localConnection.transaction(tx => {
      // Optional: clear old data
      tx.executeSql('DELETE FROM Dis_Barcode_Data_Local');
      tx.executeSql('DELETE FROM  Dis_Scaned_QR_Data_Local');

      result.forEach(item => {
        tx.executeSql(
          `INSERT OR REPLACE INTO Dis_Barcode_Data_Local (
      TripID,
      TripDate,
      VehicleType,
      VehicleID,
      InvId,
      InvNo,
      InvDate,
      AgentId,
      AgentName,
      Bt_CustId,
      Bt_Name,
      St_CustId,
      St_Name,
      OrderID,
      ChallanId,
      ChallanNo,
      ChallanDate,
      ItemID,
      ItemName,
      ChallanQty,
      PackingTypeId,
      PackingTypeName,
      BarcodeId,
      BarCode,
      BarCodeQty
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.TripID,
            item.TripDate,
            item.VehicleType,
            item.VehicleID,
            item.InvId,
            item.InvNo,
            item.InvDate,
            item.AgentId,
            item.AgentName,
            item.Bt_CustId,
            item.Bt_Name,
            item.St_CustId,
            item.St_Name,
            item.OrderID,
            item.ChallanId,
            item.ChallanNo,
            item.ChallanDate,
            item.ItemID,
            item.ItemName,
            item.ChallanQty,
            item.PackingTypeId,
            item.PackingTypeName,
            item.BarcodeId,
            item.BarCode,
            item.BarCodeQty,
          ],
        );
      });
    });

    console.log('BarcodeData sync completed 🔥🔥🔥');
  } catch (error) {
    throw error;
  }
};
const isBarcodeExistInServer = async barCode => {
  debugger;
  try {
    const mssql = await getMSSQLConnection();

    const query = `
      SELECT COUNT(1) AS Total
      FROM Dis_Scaned_QR_Data
      WHERE BarCode = '${barCode}'
    `;

    const result = await mssql.executeQuery(query);

    return result[0].Total > 0;
  } catch (error) {}
};
const insertConflictQRCode = async item => {
  try {
    const mssql = await getMSSQLConnection();

    const query = `
      INSERT INTO Dis_Conflict_Scaned_QR_Data
      (
        Local_ID,
        OrderID,
        ItemID,
        CustID,
        VehicleID,
        BarCode,
        Latitude,
        Longitude,
        UserID,
        deviceTimeAt,
        EInvoiceID
      )
      VALUES
      (
          '${item.ID || ''}',
          '${item.OrderID || ''}',
          ${item.ItemID || 0},
          ${item.CustID || 0},
          '${item.VehicleID || ''}',
          '${item.BarCode || ''}',
          ${item.Latitude || 0},
          ${item.Longitude || 0},
          ${item.UserID || 0},
          '${item.CreatedAt || ''}',
          ${item.EInvoiceID ?? 'NULL'}
          )
    `;

    await mssql.executeUpdate(query);
  } catch (error) {}
};

//offline to online Sync
const qrCodeScannedDataSync = async () => {
  const hasInternet = await isInternet();

  if (!hasInternet) {
    console.log(`No Internet Avilable........`);
    return;
  }

  const localConnection = getSQLiteConnection();

  // Get only unsynced records
  const localQuery = `
    SELECT *
    FROM Dis_Scaned_QR_Data_Local
    WHERE IsSynced = 0
  `;

  const result = await localConnection.executeQuery(localQuery);

  if (!result || result.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0, totalCount: 0 };
  }

  const mssql = await getMSSQLConnection();
  let syncedCount = 0;
  let failedCount = 0;
  let lastError = null;

  for (const item of result) {
    try {
      const exists = await isBarcodeExistInServer(item.BarCode);

      if (exists) {
        // Save in conflict table
        await insertConflictQRCode(item);

        // Mark local record as synced
        await localConnection.executeQuery(
          `UPDATE Dis_Scaned_QR_Data_Local
           SET IsSynced = 1
           WHERE ID = ?`,
          [item.ID],
        );

        syncedCount++;
        continue;
      }

      const query = `
        INSERT INTO Dis_Scaned_QR_Data (
          Local_ID,
          OrderID,
          ItemID,
          CustID,
          VehicleID,
          BarCode,
          Latitude,
          Longitude,
          UserID,
          deviceTimeAt,
          EInvoiceID

        )
        VALUES (
          '${item.ID || ''}',
          '${item.OrderID || ''}',
          ${item.ItemID || 0},
          ${item.CustID || 0},
          '${item.VehicleID || ''}',
          '${item.BarCode || ''}',
          ${item.Latitude || 0},
          ${item.Longitude || 0},
          ${item.UserID || 0},
          '${item.CreatedAt || ''}',
          ${item.EInvoiceID ?? 'NULL'}
          )
      `;
      await mssql.executeUpdate(query);

      // Mark record as synced in SQLite
      await localConnection.executeQuery(
        `UPDATE Dis_Scaned_QR_Data_Local
         SET IsSynced = 1
         WHERE ID = ?`,
        [item.ID],
      );
      syncedCount++;
    } catch (err) {
      failedCount++;
      lastError = err;
      console.log(`Failed to sync QR ID ${item.ID}`, err);
    }
  }

  if (syncedCount === 0 && failedCount > 0) {
    throw new Error(
      lastError?.message || `Failed to sync all ${failedCount} items.`,
    );
  }

  return {
    success: true,
    syncedCount,
    failedCount,
    totalCount: result.length,
  };
};

export { syncVechileTable, barcodeDataSync, qrCodeScannedDataSync };
