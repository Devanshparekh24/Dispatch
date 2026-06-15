import { getSQLiteConnection, getMSSQLConnection } from '../backend/DB/db';


const userServerExist = async (mobile, password) => {
    try {

        // Check local DB first
        if (await userLocalExist(mobile, password)) {
            return true;
        }

        // Check server
        const serverConn = await getMSSQLConnection();

        const query = `
            SELECT COUNT(1) AS Total
            FROM User_Master
            WHERE Mobile='${mobile}'
            AND Password='${password}'
        `;

        const result = await serverConn.query(query);

        if (result[0].rows[0].Total > 0) {
            // Save locally for future offline login
            await inserUserMasterTable(mobile, password);

            return true;
        }

        return false;

    } catch (error) {
        console.log(error);
        return false;
    }
};
const inserUserMasterTable = async (mobile, password) => {
    try {
        const connection = await getSQLiteConnection();
        const query = 'INSERT INTO User_Local (Mobile, Password) VALUES (?, ?)';
        await connection.executeQuery(query, [mobile, password]);
    } catch (error) {
        console.error('Error inserting user Local:', error);
    }
}
const userLocalExist = async (mobile, password) => {
    try {
        const connection = await getSQLiteConnection();
        const query = 'SELECT count(1) as Total FROM User_Local WHERE Mobile = ? and password = ?';
        const result = await connection.executeQuery(query, [mobile, password]);

        if (result[0].rows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking user Local:', error);
    }
}


const createUserMasterTable = async () => {
    try {
        const connection = await getSQLiteConnection();
        const query = 'CREATE TABLE IF NOT EXISTS User_Local (ID INTEGER PRIMARY KEY AUTOINCREMENT,Mobile TEXT, Password TEXT)';
        await connection.executeQuery(query);
    } catch (error) {
        console.error('Error creating user Local table:', error);
    }
}



export {
    createUserMasterTable,
    inserUserMasterTable,
    userServerExist
}