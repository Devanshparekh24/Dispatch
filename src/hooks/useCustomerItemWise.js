import { useQuery } from '@tanstack/react-query';
import { getItemDataScannedInfo,getTotalSyncData } from '../service/scanningService'

const useCustomerItemWise = (CustID, VehicleID) => {
    return useQuery({
        queryKey: ['getCustomerItm', CustID, VehicleID],
           queryFn: () => getItemDataScannedInfo(CustID, VehicleID),

        retry: 1,
        refetchOnWindowFocus: true,
    })
}

export const useTotalSyncData=()=>{
    return useQuery({
        queryKey: ['getTotalSyncData'],
        queryFn:async () =>await getTotalSyncData(),
        retry: 1,
        refetchOnWindowFocus: true,
        staleTime:1000*60*1
    })
}
export default useCustomerItemWise;

