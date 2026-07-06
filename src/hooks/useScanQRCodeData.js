import { useMutation } from '@tanstack/react-query';
import { insertLocalScanningQRData } from '../service/scanningService';

 const useScanQRCodeData = () => {
    return useMutation({
        mutationFn: ({ OrderID,CustId,VehicleID,BarCode,Latitude,Longitude,UserID,CreatedAt }) =>
            insertLocalScanningQRData(OrderID,CustId,VehicleID,BarCode,Latitude,Longitude,UserID,CreatedAt),
    });
};

export default useScanQRCodeData;