import { useQuery } from '@tanstack/react-query';
import { getItemDataScannedInfo } from '../service/scanningService'

const useCustomerItemWise = (CustID, VehicleID) => {
    return useQuery({
        queryKey: ['getCustomerItm', CustID, VehicleID],
           queryFn: () => getItemDataScannedInfo(CustID, VehicleID),

        retry: 1,
        refetchOnWindowFocus: true,
    })
}

export default useCustomerItemWise;

