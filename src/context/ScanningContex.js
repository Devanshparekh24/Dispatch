import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScanningContex = createContext();

export const StateProvider = ({ children }) => {
    const [currentVehicleID, setCurrentVehicleID] = useState("")



    useEffect(()=>{
        const vehileDataLoad =async()=>{
            
            try {
                const saveVehileID = await AsyncStorage.getItem('vehicleID');
                if (saveVehileID) {
                    setCurrentVehicleID(saveVehileID);
                }
            } catch (error) {
                console.log("🚀 ~ vehileDataLoad ~ error:", error)
            }
        }
        vehileDataLoad()
    }, [])

    const setVehileID=(value)=>{
        setCurrentVehicleID(value);
        AsyncStorage.setItem('vehicleID',value || '');
    }
    
    return (
        <ScanningContex.Provider value={{
            currentVehicleID,
             setCurrentVehicleID,
             setVehileID
            
        }}>
            {children}
        </ScanningContex.Provider>
    );
};


  export const useScanningContex = () => useContext(ScanningContex);
