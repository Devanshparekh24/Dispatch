import { getMSSQLConnection } from '../backend/DB/db';
import { getSQLiteConnection } from '../backend/DB/db';

const fetchUserMasterList = async () => {
    const connection = await getMSSQLConnection();
    const query = 'select Um.Mobile, Um.Password From User_Master as Um';
    const result = await connection.executeQuery(query);

    if (Array.isArray(result)) {
        return result;
    }
    throw new Error('Database query did not return a list of rows');
};


const createUserMasterTable = async () => {
    try {
        const connection = await getSQLiteConnection();
        const query = 'CREATE TABLE IF NOT EXISTS User_Local (ID INTEGER PRIMARY KEY AUTOINCREMENT,Mobile TEXT, Password TEXT)';
        await connection.executeQuery(query);
    } catch (error) {
        console.error('Error creating user Local table:', error);
    }
}

const inserUserMasterTable = async (mobile, password) => {
    try {
        const connection = await getSQLiteConnection();
        const query = 'INSERT INTO User_Local (Mobile, Password) VALUES (?, ?)';
        await connection.executeQuery(query, [mobile, password]);
    } catch (error) {
        console.error('Error inserting user Local:', error);
    }
}

export {
    fetchUserMasterList,
    createUserMasterTable,
    inserUserMasterTable
}