import { useMutation } from '@tanstack/react-query';
import { delAllData } from '../service/scanningService';

const useDelAllData = () => {
  return useMutation({
    mutationFn:  () =>  delAllData(),
  });
};

export default useDelAllData;
