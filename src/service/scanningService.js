import { getSQLiteConnection } from '../backend/DB/db';

const getlocalVechical = async () => {
    try {
        let localConnection = getSQLiteConnection();
        const localQuery = `select distinct VehicleID From Vechile_Master_Local`;
        const result = await localConnection.executeQuery(localQuery);
        console.log("🚀 ~ getlocalVechical ~ result:", result)

        if (Array.isArray(result)) {
            return result;
        }
        throw new Error('Database query did not return a list of rows');

    } catch (error) {
        console.log("🚀 ~ getlocalVechical ~ error:", error);
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
        console.log("🚀 ~ getPartyName ~ result:", result)
        if (Array.isArray(result)) {
            return result;
        }
        throw new Error('Database query did not return a list of rows');
        
    } catch (error) {
        console.log("🚀 ~ getPartyName ~ error:", error);
        return [];
    }
};


const getItemDataScannedInfo = async (CustID,VehicleID) => {
    console.log("🚀 ~ getItemDataScannedInfo ~ CustID:", CustID)
    try {
        let localConnection = getSQLiteConnection();
        // const localQuery = `SELECT 
        //                     aa.ItemName,
        //                     COUNT(aa.BarCode) AS Total_Qty,
        //                     COUNT(bb.BarCode) AS Scanned_Qty
        //                     FROM Barcode_Data_Local as aa
        //                     LEFT JOIN (
        //                         SELECT DISTINCT OrderID, BarCode
        //                         FROM Dis_Scaned_QR_Data_Local
        //                     ) as bb
        //                         ON TRIM(aa.BarCode) = TRIM(bb.BarCode)
        //                         AND TRIM(aa.OrderID) = TRIM(bb.OrderID)
        //                     WHERE aa.CustID = ? AND aa.VehicleID = ?
        //                     GROUP BY aa.ItemName`;
        const localQuery = `SELECT
                        aa.ItemName,
                        COUNT(aa.BarCode) AS Total_Qty,
                        (
                            SELECT COUNT(oo.BarCode)
                            FROM Dis_Scaned_QR_Data_Local AS oo
                            WHERE oo.CustID = aa.CustID
                        ) AS Scanned_Qty
                    FROM Barcode_Data_Local AS aa
                    WHERE aa.CustID = ?
                    AND aa.VehicleID = ?
                    GROUP BY aa.ItemName, aa.ItemID;`;
        const result = await localConnection.executeQuery(localQuery, [CustID, VehicleID]);
        console.log("🚀 ~ getItemDataScannedInfo ~ result:", result)
        if (Array.isArray(result)) {
            return result;
        }
        throw new Error('Database query did not return a list of rows');
        
    } catch (error) {
        console.log("🚀 ~ getItemName ~ error:", error);
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
        console.log("🚀 ~ getlocalBarCodeData ~ error:", error);
        return [];
    }
};


const insertLocalScanningQRData=async(OrderID,CustID,VehicleID,BarCode,Latitude,Longitude)=>{
    try {
        
        let localConnection=getSQLiteConnection();
        const localQuery=`INSERT INTO Dis_Scaned_QR_Data_Local (OrderID,CustID,VehicleID,BarCode,Latitude,Longitude)
                            values(?,?,?,?,?,?)`;
                            
        await localConnection.transaction(tx => {
      tx.executeSql(
        localQuery,
        [OrderID,CustID,VehicleID,BarCode,Latitude,Longitude],
        () => {
          console.log('Dis_Scaned_QR_Data_Local table insert successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~Inserting in insertLocalScanningQRData ~ error:", error || txOrError)
        }
      );
    });

    } catch (error) {
        console.log("🚀 ~ insertLocalScanningQRData ~ error:", error)
    }
}

const getScannendData = async () => {
    try {
        let localConnection = getSQLiteConnection();
        const localQuery = `select * From Dis_Scaned_QR_Data_Local`;
        const result = await localConnection.executeQuery(localQuery);
        console.log("🚀 ~ getScannendData ~ result:", result)
        
        if (Array.isArray(result)) {
            return result;
        }
        throw new Error('Database query did not return a list of rows');
        
    } catch (error) {
        console.log("🚀 ~ getlocalBarCodeData ~ error:", error);
        return [];
    }
};

export {
    getlocalVechical,
    getlocalBarCodeData,
    getPartyName,
    insertLocalScanningQRData,
    getScannendData,
    getItemDataScannedInfo
};


