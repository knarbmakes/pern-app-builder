import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Box, Heading, Button, Container, Flex } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

function AppContent() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Container centerContent>
      <Box textAlign="center" fontSize="xl">
        <Flex minH="100vh" p={3} flexDirection="column" justifyContent="center" alignItems="center">
          <Box p={4}>
            {user && (
              <Box>
                <Heading mb={4}>Welcome, {user.username}!</Heading>
                <Button mt={4} colorScheme="teal" onClick={logout}>
                  Logout
                </Button>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    </Container>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
