import { useGenericMutate } from '../core/useGenericMutate';
import { QK_GET_USER } from './useGetUser';
import { CommonTypes } from 'common';

export function useLogin() {
  // Equivalent of calling return useMutation(...)
  // Returns a react-query UseMutationResult object.
  return useGenericMutate<CommonTypes.User>({
    url: `/login`,
    type: 'post',
    useAuth: false,
    clearKeys: [[QK_GET_USER]],
  });
}
