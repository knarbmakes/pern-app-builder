import { useMutation, useQueryClient } from 'react-query';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

interface Params {
  url: string;
  type: 'put' | 'post' | 'delete';
  useAuth?: boolean;
  clearKeys?: any[];
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: any) => void;
}

export function useGenericMutate<T>(params: Params) {
  const { getAccessToken, setAccessTokenFromResponse } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation(
    async (body: any) => {
      const accessToken = getAccessToken && (await getAccessToken());
      let headers = {};
      if (params.useAuth && accessToken) {
        headers = {
          Authorization: `Bearer ${accessToken}`,
        };
      }
      const axiosFn = axios[params.type];
      let response;
      if (params.type === 'delete') {
        // Dlete doesn't have a body.
        response = await axiosFn(`${process.env.REACT_APP_BACKEND_API_URL}${params.url}`, {
          withCredentials: true,
          headers,
        });
      } else {
        response = await axiosFn(`${process.env.REACT_APP_BACKEND_API_URL}${params.url}`, body || {}, {
          withCredentials: true,
          headers,
        });
      }
      if (setAccessTokenFromResponse) setAccessTokenFromResponse(response);
      return response.data as T;
    },
    {
      onError: (error) => {
        if (params.onError) params.onError(error);
      },
      onSuccess: (data, variables) => {
        if (params.onSuccess) params.onSuccess(data, variables);

        if (!params.clearKeys) return;
        for (const key of params.clearKeys) {
          queryClient.invalidateQueries(key);
        }
      },
    }
  );
}
