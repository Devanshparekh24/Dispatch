import { getSQLiteConnection, getMSSQLConnection } from '../backend/DB/db';
import isInternet from '../utils/network';


let localConnection = getSQLiteConnection();

const syncVechileTable = async () => {
    try {
        const connect = await isInternet();
        if (!connect) {
            console.log('Internet Is not connected .....');
            return;
        }

        const mssqlConn = await getMSSQLConnection();
        const serverquery = `select distinct Tm.VehicleID From Trip_Master_New as Tm
                        where VehicleType='Internal'`;
        const result = await mssqlConn.executeQuery(serverquery);
        console.log("🚀 ~ syncVechileTable ~ result:", result);

        if (!result || result.length === 0) {
            console.log('No vehicle data found on remote server.');
            return;
        }

        await localConnection.transaction(tx => {
            // Optional: clear old data
            tx.executeSql('DELETE FROM Vechile_Master_Local');

            result.forEach(item => {
                tx.executeSql(
                    'INSERT INTO Vechile_Master_Local (VehicleID) VALUES (?)',
                    [item.VehicleID]
                );
            });
        });

        console.log('Vehicle sync completed 🔥🔥🔥');
    } catch (error) {
        console.log("🚀 ~ syncVechileTable ~ error:", error);
    }
};


const barcodeDataSync = async() => {
    try {
        const connect = await isInternet();
        if (!connect) {
            console.log('Internet Is not connected .....');
            return;
        }
        const mssqlConn = await getMSSQLConnection();
        const serverquery = `select * From Dis_vw_BarCodeData`;
        const result = await mssqlConn.executeQuery(serverquery);
        console.log("🚀 ~ barcodeDataSync ~ result:", result)
        if (!result || result.length === 0) {
            console.log('No vehicle data found on remote server.');
            return;
        }

        await localConnection.transaction(tx => {
            // Optional: clear old data
            tx.executeSql('DELETE FROM Barcode_Data_Local');

            result.forEach(item => {
                tx.executeSql(
                    'INSERT OR REPLACE INTO Barcode_Data_Local (OrderID,BarCode,VehicleID, EInvoice_Number , CustID, CustName) VALUES (?, ?, ?,?,?,?)',
                    [item.OrderID, item.BarCode, item.VehicleID, item.EInvoice_Number,item.CustID, item.CustName]
                );
            });
        });

        console.log('BarcodeData sync completed 🔥🔥🔥');

    } catch (error) {
        console.log("🚀 ~ barcodeDataSync ~ error:", error)

    }
}

export {
    syncVechileTable,
    barcodeDataSync
};
