import { useQuery } from '@tanstack/react-query';
import { getPartyName } from '../service/scanningService'

const useCustomer = () => {
    return useQuery({
        queryKey: ['getCustomer'],
        queryFn: async () => {
            try {
                const data = await getPartyName();
                return {
                    data,
                    errorMsg: null
                }
            } catch (error) {
                console.log("🚀 ~ useCustomer ~ error:", error)
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

export default useCustomer;

