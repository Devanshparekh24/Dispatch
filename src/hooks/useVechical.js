import { useQuery } from '@tanstack/react-query';
import { getlocalVechical } from '../service/scanningService'

const useVechicle = () => {
    return useQuery({
        queryKey: ['getVechical'],
        queryFn: async () => {
            try {
                const data = await getlocalVechical();
                return {
                    data,
                    errorMsg: null
                }
            } catch (error) {
                console.log("🚀 ~ useVechicle ~ error:", error)
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

export default useVechicle;

