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
        const localQuery = `select distinct CustID, CustName From Barcode_Data_Local`;
        const result = await localConnection.executeQuery(localQuery);
        
        if (Array.isArray(result)) {
            return result;
        }
        throw new Error('Database query did not return a list of rows');
        
    } catch (error) {
        console.log("🚀 ~ getlocalVechical ~ error:", error);
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
        console.log("🚀 ~ getlocalVechical ~ error:", error);
        return [];
    }
};


export {
    getlocalVechical,
    getlocalBarCodeData,
    getPartyName
};


