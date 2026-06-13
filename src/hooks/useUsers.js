import { useQuery } from '@tanstack/react-query';
import { fetchUserMasterList } from '../service/userService';



/**
 * Custom hook to retrieve and cache User Master records.
 * Falls back to mock data if the MSSQL connection fails.
 */
 const useUsersQuery = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            try {
                const data = await fetchUserMasterList();
                return { data, isMock: false, errorMsg: null };
            } catch (err) {
                console.warn('[useUsersQuery] Connection failed. Using simulated fallback data.', err.message);
                return {
                    data: [],
                    isMock: true,
                    errorMsg: err.message || 'All database connections failed.'
                };
            }
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // Cache stays fresh for 5 minutes
    });
};

export{
    useUsersQuery
}