import { getSQLiteConnection } from '../backend/DB/db';

const createUserMasterTable = async () => {
  try {
    const connection = await getSQLiteConnection();

    const query = `
      CREATE TABLE IF NOT EXISTS User_Local (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Mobile TEXT UNIQUE,
        Password TEXT
      )
    `;

    connection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('User_Local table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createUserMasterTable ~ error:", error || txOrError)
        }
      );
    });

  } catch (error) {
  console.log("🚀 ~ createUserMasterTable ~ error:", error)

    throw error;
  }
};

const createVechileMaster =async()=>{
  try{

    const Localconnection = await getSQLiteConnection();

    const query = `
      CREATE TABLE IF NOT EXISTS Vechile_Master_Local (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        VehicleID TEXT 
      )
    `;

    Localconnection.transaction(tx => {
      tx.executeSql(
        query,
        [],
        () => {
          console.log('Vechile_Master_Local table created successfully');
        },
        (txOrError, error) => {
          console.log("🚀 ~ createVechileMaster ~ error:", error || txOrError)
        }
      );
    });
  }catch(error){
    console.log("🚀 ~ createVechileMaster ~ error:", error)
    throw error;
  }
}


const initTable =async()=>{
  try {
    await createUserMasterTable();
    await createVechileMaster();

  } catch (error) {
    console.log("🚀 ~ initTable ~ error:", error)
    
  }
}

export default  initTable;