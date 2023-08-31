import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useLogin } from '../hooks/useLogin';
import { useGetUser } from '../hooks/useGetUser';
import { useLogout } from '../hooks/useLogout';
import { AUTH_TOKEN_LS_KEY } from '../core/const';
import { Login } from '../components/Login';
import { useRegister } from '../hooks/useRegister';
import { CommonTypes } from 'common';

const getAccessToken = () => localStorage.getItem(AUTH_TOKEN_LS_KEY);

const setAccessTokenFromResponse = (response: any) => {
  const token = response.headers.authorization?.replace('Bearer ', '');
  if (token) localStorage.setItem(AUTH_TOKEN_LS_KEY, token);
};

export interface AuthContextData {
  user: CommonTypes.User | null;
  setUser: React.Dispatch<React.SetStateAction<CommonTypes.User | null>>;
  getAccessToken: () => string | null;
  setAccessTokenFromResponse: (response: any) => void;
  logout?: () => void;
  toggleLogin?: () => void;
}

export const AuthContext = createContext<AuthContextData>({
  user: null,
  setUser: () => null,
  getAccessToken,
  setAccessTokenFromResponse,
  logout: () => null,
  toggleLogin: () => null,
});

type Props = {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<CommonTypes.User | null>(null);
  const { data: userData } = useGetUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const [showLogin, setShowLogin] = useState(false);

  const toggleLogin = () => {
    setShowLogin((prevState) => !prevState);
  };

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const toast = useToast();
  const handleToastNotification = useCallback(
    (title: string, defaultDescription: string, status: 'error' | 'success', errorResponse?: any) => {
      const description = errorResponse?.response?.data?.error || defaultDescription;
      toast({
        title,
        description,
        status,
        duration: 5000,
        isClosable: true,
      });
    },
    [toast]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync({});
      localStorage.removeItem(AUTH_TOKEN_LS_KEY);
      handleToastNotification('Success', 'You have successfully logged out', 'success');
      setShowLogin(false);
      setUser(null);
    } catch (error: any) {
      handleToastNotification('Error', 'There was an error logging out', 'error', error);
    }
  }, [handleToastNotification, logoutMutation]);

  const handleAuthentication = async (
    action: 'login' | 'register',
    email: string,
    password: string,
    username?: string
  ) => {
    try {
      const mutation = action === 'login' ? loginMutation : registerMutation;
      const result = await mutation.mutateAsync({ email, password, username });
      const successMessage = action === 'login' ? 'You have successfully logged in' : 'Your account has been created';
      handleToastNotification('Success', successMessage, 'success');
      if (result) {
        setUser(result);
      }
    } catch (error: any) {
      const errorMessage =
        action === 'login' ? 'There was an error logging in' : 'There was an error creating your account';
      handleToastNotification('Error', errorMessage, 'error', error);
    }
  };

  const value: AuthContextData = useMemo(
    () => ({
      user,
      setUser,
      getAccessToken,
      setAccessTokenFromResponse,
      logout: handleLogout,
      toggleLogin,
    }),
    [handleLogout, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {showLogin && !user ? (
        <Login
          handleLogin={(email, password) => handleAuthentication('login', email, password)}
          handleRegister={(email, password, username) => handleAuthentication('register', email, password, username)}
        />
      ) : (
        <>{children}</>
      )}
    </AuthContext.Provider>
  );
}
