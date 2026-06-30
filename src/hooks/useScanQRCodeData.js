import { useMutation } from '@tanstack/react-query';
import { insertLocalScanningQRData } from '../service/scanningService';

const useScanQRCodeData = () => {
    return useMutation({
        mutationFn: ({ CustId,VehicleID,BarCode,Latitude,Longitude }) =>
            insertLocalScanningQRData(CustId,VehicleID,BarCode,Latitude,Longitude),
    });
};

export default useScanQRCodeData;