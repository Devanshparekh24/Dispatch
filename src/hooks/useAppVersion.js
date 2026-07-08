import { useQuery } from '@tanstack/react-query';
import { getAppVersion } from '../service/appUpdateService';

const useAppVersion = () => {
  return useQuery({
    queryKey: ['getAppVersion'],
    queryFn: async () => {
      console.log('🚀 ~ useAppVersion ~ queryFn triggered');
      const res = await getAppVersion();
      console.log('🚀 ~ useAppVersion ~ queryFn resolved with:', res);
      return res;
    },
    retry: 1,
    refetchOnWindowFocus: true,
  });
};
export default useAppVersion;
