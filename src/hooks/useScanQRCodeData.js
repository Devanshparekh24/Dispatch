import { useMutation } from '@tanstack/react-query';
import { insertLocalScanningQRData } from '../service/scanningService';

const useScanQRCodeData = () => {
    return useMutation({
        mutationFn: ({ OrderID,CustId,VehicleID,BarCode,Latitude,Longitude,CreatedAt }) =>
            insertLocalScanningQRData(OrderID,CustId,VehicleID,BarCode,Latitude,Longitude,CreatedAt),
    });
};

export default useScanQRCodeData;