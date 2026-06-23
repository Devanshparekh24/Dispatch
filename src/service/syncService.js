import { getSQLiteConnection, getMSSQLConnection } from '../backend/DB/db';
import isInternet from '../utils/network';

const syncVechileTable = async () => {
    try {
        const connect = await isInternet();
        if (!connect) {
            console.log('Internet Is not connected .....');
            return;
        }

        const mssqlConn = await getMSSQLConnection();
        const localConnection = getSQLiteConnection();

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

export {
    syncVechileTable
};

