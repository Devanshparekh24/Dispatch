import { getSQLiteConnection } from '../backend/DB/db';

const getlocalVechical = async () => {
    try {
        const localConnection = getSQLiteConnection();
        const localQuery = `select * From Vechile_Master_Local`;
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
    getlocalVechical
};