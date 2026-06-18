import { useMutation } from '@tanstack/react-query';
import { userServerExist } from '../service/authService';

const useAuthentication = () => {
    return useMutation({
        mutationFn: ({ mobile, password }) =>
            userServerExist(mobile, password),
    });
};

export {
    useAuthentication
}
