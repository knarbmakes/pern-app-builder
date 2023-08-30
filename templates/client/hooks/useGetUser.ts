import { useGenericGet } from '../core/useGenericGet';
import { CommonTypes } from 'common';

export const QK_GET_USER = 'myuser';
export function useGetUser() {
  // Equivalent of calling return useQuery(...)
  // Returns a react-query UseQueryResult object.
  return useGenericGet<CommonTypes.User>({
    url: `/myuser`,
    autoFetch: true,
    query: {},
    useAuth: true,
    retry: 0,
    queryKey: [QK_GET_USER],
  });
}
