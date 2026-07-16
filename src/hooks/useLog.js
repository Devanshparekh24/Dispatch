import { useMutation } from '@tanstack/react-query';
import { saveError } from '../service/Log';
const useErroLog = () => {
  return useMutation({
    mutationFn: async ({ ErrorType, ErrorMessage, Screen }) => {
      saveError(ErrorType, ErrorMessage, Screen);
    },
  });
};



export  {useErroLog};
