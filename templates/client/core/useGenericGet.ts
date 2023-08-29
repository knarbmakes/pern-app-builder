import { useQuery } from 'react-query';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

interface Params {
  url: string;
  query?: any;
  queryKey?: any;
  useAuth?: boolean;
  autoFetch?: boolean;
  retry?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useGenericGet<T>(params: Params) {
  const { getAccessToken, setAccessTokenFromResponse } = useAuthContext();

  return useQuery(
    params.queryKey,
    async () => {
      const accessToken = getAccessToken && (await getAccessToken());
      let headers = {};
      if (params.useAuth && accessToken) {
        headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}${params.url}`, {
        params: params.query,
        withCredentials: true,
        headers,
      });
      if (setAccessTokenFromResponse) setAccessTokenFromResponse(response);
      return response.data as T;
    },
    {
      retry: params.retry ?? 3,
      enabled: params.autoFetch,
      onError: (error) => {
        if (params.onError) params.onError(error);
      },
      onSuccess: (data) => {
        if (params.onSuccess) params.onSuccess(data);
      },
    }
  );
}