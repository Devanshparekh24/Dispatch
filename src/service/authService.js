import { getSQLiteConnection, getMSSQLConnection } from '../backend/DB/db';

const userServerExist = async (mobile, password) => {
  try {
    // Check local DB first
    if (await userLocalExist(mobile, password)) {
      return true;
    }

    // Check server
    const serverConn = await getMSSQLConnection();
    console.log('🚀 ~ userServerExist ~ serverConn:', serverConn);

    const query = `
            SELECT Mobile,Password,UserName,UserID
            FROM User_Master
            WHERE Mobile='${mobile}'
            AND Password='${password}'
        `;

    const result = await serverConn.executeQuery(query);
    console.log('🚀 ~ userServerExist ~ result:', result);

    if (result?.length > 0) {
      await inserUserMasterTable(
        result[0].Mobile,
        result[0].Password,
        result[0].UserName,
        result[0].UserID,
      );
      return true;
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
const inserUserMasterTable = async (mobile, password, username, userId) => {
  try {
    const connection = await getSQLiteConnection();
    const query =
      'INSERT INTO User_Local (Mobile, Password,UserName,UserID) VALUES (?, ?,?,?)';
    await connection.executeQuery(query, [mobile, password, username, userId]);
  } catch (error) {
    console.log('🚀 ~ inserUserMasterTable ~ error:', error);
  }
};
const userLocalExist = async (mobile, password) => {
  try {
    const connection = await getSQLiteConnection();
    const query =
      'SELECT count(1) as Total FROM User_Local WHERE Mobile = ? and password = ?';
    const result = await connection.executeQuery(query, [mobile, password]);
    console.log('🚀 ~ userLocalExist ~ result:', result);

    if (result && result.length > 0 && result[0].Total > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking user Local:', error);
    return false;
  }
};

const getLocalUsers = async () => {
  try {
    const connection = await getSQLiteConnection();
    const query = 'SELECT * FROM User_Local';
    const result = await connection.executeQuery(query);
    return result;
  } catch (error) {
    console.log('🚀 ~ getLocalUsers ~ error:', error);
    return [];
  }
};

const forgetPassword = async mobileNO => {
  try {
    const serverConnection = await getMSSQLConnection();
    const query = `
            SELECT count(1) as Total FROM User_Master
            WHERE Mobile = '${mobileNO}'
        `;
    const result = await serverConnection.executeQuery(query);

    if (result && result.length > 0 && result[0].Total > 0) {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP:', otp);
      return { success: true, otp };
    } else {
      return {
        success: false,
        message: `${mobileNO} Number is Not Registered`,
      };
    }
  } catch (error) {
    console.log('🚀 ~ forgetPassword ~ error:', error);
    return {
      success: false,
      message: error.message || 'Error checking mobile number',
    };
  }
};

const updatePassword = async (mobileNO, newPassword) => {
  try {
    const serverConnection = await getMSSQLConnection();
    const query = `
            UPDATE User_Master
            SET Password = '${newPassword}'
            WHERE Mobile = '${mobileNO}'
        `;
    await serverConnection.executeUpdate(query);
    return { success: true };
  } catch (error) {
    console.log('🚀 ~ updatePassword ~ error:', error);
    return { success: false };
  }
};

export { inserUserMasterTable, userServerExist, getLocalUsers, forgetPassword,updatePassword };
