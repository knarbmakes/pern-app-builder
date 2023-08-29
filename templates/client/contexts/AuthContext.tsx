import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useLogin } from '../core/useLogin';
import { AUTH_TOKEN_LS_KEY } from '../core/const';
import { Login } from '../components/Login';
import { useGetUser } from '../core/useGetUser';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Auth context data
export interface AuthContextData {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  getAccessToken?: () => string | null;
  setAccessTokenFromResponse?: (response: any) => void;
}

// Initialize Auth context with empty object
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const getAccessToken = () => {
  return localStorage.getItem(AUTH_TOKEN_LS_KEY);
};

const setAccessTokenFromResponse = (response: any) => {
  if (response.headers.authorization) {
    localStorage.setItem(AUTH_TOKEN_LS_KEY, response.headers.authorization);
  }
};

type Props = {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
};

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const { data: userData } = useGetUser();
    const loginMutation = useLogin();
    const toast = useToast();
  
    useEffect(() => {
      if (userData) {
        setUser(userData);
      }
    }, [userData]);
  
    const value: AuthContextData = useMemo(
      () => ({
        user,
        setUser,
        getAccessToken,
        setAccessTokenFromResponse,
      }),
      [user]
    );
  
    const handleSubmit = async (e: React.FormEvent, username: string, password: string) => {
      e.preventDefault();
  
      try {
        await loginMutation.mutateAsync({ username, password });
        // User will be automatically updated due to the `onSuccess` in `useLogin`
      } catch (error) {
        toast({
          title: 'Error',
          description: 'There was an error logging in',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
  
    return (
      <AuthContext.Provider value={value}>
        {!user ? <Login handleSubmit={handleSubmit} /> : <>{children}</>}
      </AuthContext.Provider>
    );
  }