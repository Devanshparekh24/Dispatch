import { getSQLiteConnection } from '../backend/DB/db';


let localConn = getSQLiteConnection();

const saveError = async (ErrorType, ErrorMessage, Screen) => {
    try {

        let query = `insert into Dis_Error_Log (ErrorType,ErrorMessage,Screen,CreatedAt) values (?,?,?,?)`;
        localConn.transaction(tx => {
            tx.executeSql(
                query,
                [ErrorType, ErrorMessage, Screen, new Date().toISOString()],
                () => {
                    console.log('Error logged successfully');
                },
                (txOrError, error) => {
                    console.log("🚀 ~ logError ~ error:", error || txOrError)
                }
            );
        });
    } catch (error) {
        console.log("🚀 ~ logError ~ error:", error)
    }
}



const getErrorLog =()=>{
    try {
        const query = `SELECT * FROM Dis_Error_Log`;
        localConn.transaction(tx => {
            tx.executeSql(
                query,
                [],
                (_, { rows }) => {
                    console.log('Error logs:', rows._array);
                    return rows._array;
                },
                (txOrError, error) => {
                    console.log("🚀 ~ getErrorLog ~ error:", error || txOrError)
                }
            );
        });
    } catch (error) {
        console.log("🚀 ~ getErrorLog ~ error:", error)
    }
}
export default {saveError,getErrorLog};