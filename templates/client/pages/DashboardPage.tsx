import React from 'react';
import { Box, Heading, Button, Container } from '@chakra-ui/react';
import { useAuthContext } from '../core/useAuthContext'; // Replace the import path with the correct one for your setup

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthContext();

  return (
    <Container>
      {user && (
        <Box>
          <Heading mb={4}>Dashboard</Heading>
          <p>Welcome, {user.username}!</p>
          <Button mt={4} colorScheme="teal" onClick={logout}>
            Logout
          </Button>
        </Box>
      )}
    </Container>
  );
};
