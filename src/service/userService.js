import { getMSSQLConnection } from '../backend/DB/db';

const fetchUserMasterList = async () => {
    const connection = await getMSSQLConnection();
    const query = 'select Um.Mobile, Um.Password From User_Master as Um';
    const result = await connection.executeQuery(query);

    if (Array.isArray(result)) {
        return result;
    }
    throw new Error('Database query did not return a list of rows');
};

export {
    fetchUserMasterList
}