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
        // const localQuery = `select CustID,
        // CustName, 
        // VehicleID,
        // sum(Qty) as Total_Bags,
        // count(*)as No_of_Item
        // From Barcode_Data_Local
        // group by CustID,CustName,VehicleID`;
        const localQuery = `SELECT
    CustName,
    CustID,
    VehicleID,
    SUM(Qty) AS Total_Qty,
    COUNT(distinct ItemName) AS No_of_Items,
    COUNT(BarCode) AS Total_QR_Code
FROM Barcode_Data_Local 
GROUP BY
    CustID,
    CustName,
    VehicleID;`;
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


const insertLocalScanningQRData=async(CustID,VehicleID,BarCode,Latitude,Longitude)=>{
    try {
        
        let localConnection=getSQLiteConnection();

        const localQuery=`INSERT INTO Dis_Scaned_QR_Data_Local (CustID,VehicleID,BarCode,Latitude,Longitude)
                            values(?,?,?,?,?)
    `
        await localConnection.transaction(tx => {
      tx.executeSql(
        localQuery,
        [CustID,VehicleID,BarCode,Latitude,Longitude],
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
    getScannendData
};


