import { getSQLiteConnection, getMSSQLConnection } from '../backend/DB/db';


const userServerExist = async (mobile, password) => {
    try {

        // Check local DB first
        if (await userLocalExist(mobile, password)) {
            return true;
        }

        // Check server
        const serverConn = await getMSSQLConnection();
        console.log("🚀 ~ userServerExist ~ serverConn:", serverConn)

        const query = `
            SELECT COUNT(1) AS Total
            FROM User_Master
            WHERE Mobile='${mobile}'
            AND Password='${password}'
        `;

        const result = await serverConn.executeQuery(query);
        console.log("🚀 ~ userServerExist ~ result:", result)

        if (result && result.length > 0 && result[0].Total > 0) {
            // Save locally for future offline login
            await inserUserMasterTable(mobile, password);
        }

         // Check local DB first
        if (await userLocalExist(mobile, password)) {
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
    console.log("🚀 ~ inserUserMasterTable ~ error:", error)
        
    }
}
const userLocalExist = async (mobile, password) => {
    try {
        const connection = await getSQLiteConnection();
        const query = 'SELECT count(1) as Total FROM User_Local WHERE Mobile = ? and password = ?';
        const result = await connection.executeQuery(query, [mobile, password]);
        console.log("🚀 ~ userLocalExist ~ result:", result)

        if (result && result.length > 0 && result[0].Total > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking user Local:', error);
        return false;
    }
}





const getLocalUsers = async () => {
  try {
    const connection = await getSQLiteConnection();
    const query = 'SELECT * FROM User_Local';
    const result = await connection.executeQuery(query);
    return result;
  } catch (error) {
    console.log("🚀 ~ getLocalUsers ~ error:", error)
    return [];
  }
};

export {
    inserUserMasterTable,
    userServerExist,
    getLocalUsers
}