import { useQuery } from '@tanstack/react-query';
import { getSelectVehileData } from '../service/scanningService'

const useSelectVehileID = () => {
    return useQuery({
        queryKey: ['getSelectVehileID'],
           queryFn: async() =>await getSelectVehileData(),

        retry: 1,
        refetchOnWindowFocus: true,
    })
}
export default useSelectVehileID;

