import React from 'react';
import { Box, Text, Heading, Button, Center } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const ErrorPage: React.FC = () => {
  return (
    <Center>
      <Box textAlign="center" p={8} rounded={8}>
        <Heading as="h2" size="xl" mb={4}>
          Oops!
        </Heading>
        <Text fontSize="lg" mb={4}>
          The content you're looking for was not found.
        </Text>
        <Button as={Link} to="/" colorScheme="orange">
          Go Home
        </Button>
      </Box>
    </Center>
  );
};
