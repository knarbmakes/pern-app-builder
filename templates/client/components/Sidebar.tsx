import React from 'react';
import { Box, Text, VStack, Link, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../core/useAuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const goToPage = (path: string) => {
    navigate(path);
  };

  const { toggleLogin } = useAuthContext();

  return (
    <Box as="nav" bg="blackAlpha.200" w="200px" minH="100vh" p="4">
      <VStack align="start" spacing={4}>
        <Link onClick={() => goToPage('/')} textDecoration="underline">
          <Text>Home</Text>
        </Link>
        <Link onClick={() => goToPage('/dashboard')} textDecoration="underline">
          <Text>Dashboard</Text>
        </Link>
        <Button onClick={toggleLogin}>Login</Button>;
      </VStack>
    </Box>
  );
};
