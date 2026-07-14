import { useMutation } from '@tanstack/react-query';
import { insertLocalScanningQRData } from '../service/scanningService';

const useScanQRCodeData = () => {
  return useMutation({
    mutationFn: ({
      St_CustID,
      BarCode,
      Latitude,
      Longitude,
      UserID,
      CreatedAt,
    }) =>
      insertLocalScanningQRData(
        St_CustID,
        BarCode,
        Latitude,
        Longitude,
        UserID,
        CreatedAt,
      ),
  });
};

export default useScanQRCodeData;
