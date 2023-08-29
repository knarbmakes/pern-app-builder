import { useQuery } from 'react-query';
import axios from 'axios';
import { AUTH_TOKEN_LS_KEY } from './const';

async function getUser() {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_LS_KEY);
    const response = await axios.get('/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Could not fetch user: ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Could not fetch user: No response received');
    } else {
      throw new Error(`Could not fetch user: ${error.message}`);
    }
  }
}

export function useGetUser() {
  return useQuery('user', getUser);
}
