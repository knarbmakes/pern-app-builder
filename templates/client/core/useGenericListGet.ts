import { useInfiniteQuery } from 'react-query';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

interface Params {
  url: string;
  query?: any;
  limit?: number;
  queryKey?: any;
  useAuth?: boolean;
  retry?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  nextPageFn?: (lastPage: any, pages: any) => any;
}

export function useGenericListGet<T>(params: Params) {
  const { getAccessToken, setAccessTokenFromResponse } = useAuthContext();
  return useInfiniteQuery(
    params.queryKey,
    async ({ pageParam }) => {
      const accessToken = getAccessToken && (await getAccessToken());
      let headers = {};
      if (params.useAuth && accessToken) {
        headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      const searchParams = {
        ...params.query,
        limit: params.limit,
        lastId: pageParam,
      };
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}${params.url}`, {
        params: searchParams,
        withCredentials: true,
        headers,
      });

      if (setAccessTokenFromResponse) setAccessTokenFromResponse(response);

      // Collecting next page element to check if there is more elements
      const nextPageElement = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}${params.url}`, {
        params: { ...params.query, limit: 1, lastId: response.data[response.data.length - 1]?.id },
        withCredentials: true,
        headers: headers,
      });

      const hasMore = nextPageElement.data.length > 0;

      return { data: response.data as T[], hasMore };
    },
    {
      retry: params.retry ?? 3,
      getNextPageParam: params.nextPageFn
        ? params.nextPageFn
        : (lastPage, pages) => {
            if (lastPage && lastPage.hasMore) {
              const lastElement = lastPage.data[lastPage.data.length - 1] as any;
              return lastElement?.id;
            }
            return undefined;
          },
    }
  );
}
