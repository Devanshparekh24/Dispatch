import { getMSSQLConnection } from '../backend/DB/db';
import isInternet from '../utils/network';

const getAppVersion = async () => {
  try {
    const hasInternet = await isInternet();
    if (!hasInternet) {
      console.log('Internet Is not connected .....');
      return;
    }
    const serverConn = await getMSSQLConnection();
    const query = `
    select Am.AppID,    
            Ad.VersionID,    
            Ad.Version,    
            Ad.FilePath As apk_url,    
            Am.AppName,    
            Am.TDate,    
            Am.Active   From  ApplicationMaster As Am with(nolock)  
        inner join ApplicationVersion As Ad with(nolock)    on Am.AppID=Ad.AppID
        where Am.AppID=27  and Am.Active =1 and Ad.ToDate is null
    
    `;
    const result = await serverConn.executeQuery(query);
    console.log('🚀 ~ getAppVersion ~ result:', result);
    if (Array.isArray(result)) {
      console.log("🚀 ~ getAppVersion ~ result:", result)
      return result;
    }
    throw new Error('Database query did not return a list of rows');
  } catch (error) {
    console.log('🚀 ~ getAppVersion ~ error:', error);
    return null;
  }
};

export { getAppVersion };
