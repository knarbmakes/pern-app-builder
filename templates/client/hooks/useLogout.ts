import { useGenericMutate } from '../core/useGenericMutate';
import { QK_GET_USER } from './useGetUser';

export function useLogout() {
  // Equivalent of calling return useMutation(...)
  // Returns a react-query UseMutationResult object.
  return useGenericMutate<void>({
    url: `/logout`,
    type: 'put',
    useAuth: false,
    clearKeys: [[QK_GET_USER]],
  });
}
