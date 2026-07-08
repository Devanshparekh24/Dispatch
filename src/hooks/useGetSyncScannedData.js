import { useQuery } from '@tanstack/react-query';
import { getScannendData } from '../service/scanningService'

const useGetSyncScannedData = () => {
    return useQuery({
        queryKey: ['getScannedData'],
        queryFn: async () => {
            try {
                const data = await getScannendData();
                console.log("🚀 ~ useGetScannedData ~ data:", data)
                return {
                    data,
                    errorMsg: null
                }
            } catch (error) {
                console.log("🚀 ~ useGetScannedData ~ error:", error)
                return {
                    data: [],
                    errorMsg: error.message || 'All database connections failed.'
                }

            }
        },
        retry: 1,
        refetchOnWindowFocus: true,
    })
}

export default useGetSyncScannedData;

