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
                            AA.OrderID,
                            AA.CustID,
                            AA.VehicleID,
                            SUM(AA.Qty) AS Total_Qty,
                            COUNT(distinct AA.ItemName) AS No_of_Items,
                            COUNT(AA.BarCode) AS Total_QR_Code,
                            COUNT(BB.BarCode) AS Scanned_QR_Code
                        FROM Barcode_Data_Local as AA
                        LEFT JOIN Dis_Scaned_QR_Data_Local as BB 
                            ON BB.OrderID = AA.OrderID 
                        AND BB.BarCode = AA.BarCode
                        GROUP BY
                            AA.CustID,
                            AA.CustName,
                            AA.VehicleID,
                            AA.OrderID;
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
    try {
        let localConnection = getSQLiteConnection();
        const localQuery = `SELECT
                            AA.ItemName,
                            AA.OrderID,
                            AA.VehicleID,
                            SUM(AA.Qty) AS Total_Qty,
                            COUNT(distinct AA.ItemName) AS No_of_Items,
                            COUNT(AA.BarCode) AS Total_QR_Code,
                            COUNT(BB.BarCode) AS Scanned_QR_Code
                            FROM Dis_vw_BarCodeData as AA 
                            left join Dis_Scaned_QR_Data_Local as BB 
                            on AA.OrderID=BB.OrderID
                            where AA.CustID=${CustID} and AA.VehicleID=${VehicleID}
                            GROUP BY
                            AA.ItemName,
                            AA.VehicleID,
                            AA.OrderID
                            `;
        const result = await localConnection.executeQuery(localQuery);
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


