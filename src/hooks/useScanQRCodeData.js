import { useMutation } from '@tanstack/react-query';
import { insertLocalScanningQRData } from '../service/scanningService';

 const useScanQRCodeData = () => {
    return useMutation({
        mutationFn: ({ OrderID,CustId,VehicleID,BarCode,Latitude,Longitude,UserID,CreatedAt,EInvoice_Number,EInvoiceID }) =>
            insertLocalScanningQRData(OrderID,CustId,VehicleID,BarCode,Latitude,Longitude,UserID,CreatedAt,EInvoice_Number,EInvoiceID),
    });
};

export default useScanQRCodeData;