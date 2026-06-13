import { getMSSQLConnection } from '../backend/DB/db';

/**
 * Fetch all users from User_Master table using the active MSSQL connection.
 * @returns {Promise<Array<{UserName: string, Password: string}>>} List of users
 */
export const fetchUserMasterList = async () => {
    const connection = await getMSSQLConnection();
    const query = 'select Um.UserName, Um.Password From User_Master as Um';
    const result = await connection.executeQuery(query);
    
    if (Array.isArray(result)) {
        return result;
    }
    throw new Error('Database query did not return a list of rows');
};
