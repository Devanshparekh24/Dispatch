import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qrCodeScannedDataSync } from '../service/syncService';

const useQRCodeSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => qrCodeScannedDataSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTotalSyncData'] });
    },
  });
};

export default useQRCodeSync;
