import { useQuery } from '@tanstack/react-query';
import { inserUserMasterTable } from '../service/userService';



const useLocalDB = () => {
    try {



    } catch (error) {
        console.log("Local DB Error:", error.message);
    }
}


const useCheckUserMasterList = () => {
    return useQuery({
        queryKey: ['usersdata'],
        queryFn: async () => {
            try {
                const data = await inserUserMasterTable();
                return { data, errorMsg: null };
            } catch (err) {
                console.warn('[useUsersQuery] Connection failed. Using simulated fallback data.', err.message);
                return {
                    data: [],
                    errorMsg: err.message || 'All database connections failed.'
                };
            }
        },
        retry: 1,
        refetchOnWindowFocus: false,
    });
};

export {
    useUsersQuery
}