import { getSQLiteConnection } from '../backend/DB/db';


export const getLocalVehicles = async () => {
    try {
        const connection = getSQLiteConnection();
        const query = 'SELECT DISTINCT VehicleID FROM Vechile_Master_Local WHERE VehicleID IS NOT NULL AND VehicleID != ""';
        const result = await connection.executeQuery(query);
        return result || [];
    } catch (error) {
        console.error('[SQLite] Error fetching local vehicles:', error);
        return [];
    }
};
