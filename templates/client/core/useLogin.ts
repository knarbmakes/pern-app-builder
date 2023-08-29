import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { AUTH_TOKEN_LS_KEY } from './const';

type LoginData = {
  username: string;
  password: string;
};

async function login({ username, password }: LoginData) {
  try {
    const response = await axios.post('/api/login', { username, password }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;

    return data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Login failed: ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('Login failed: No response received');
    } else {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation(login, {
    onSuccess: (data: any) => {
      // Update user data upon successful login
      queryClient.invalidateQueries('user');
      localStorage.setItem(AUTH_TOKEN_LS_KEY, data.access_token);
    },
  });
}
