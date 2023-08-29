import React, { useState } from 'react';
import { Box, Input, FormControl, FormLabel, Button, FormErrorMessage } from '@chakra-ui/react';

type LoginProps = {
  handleSubmit: (e: React.FormEvent, username: string, password: string) => Promise<void>;
};

export const Login: React.FC<LoginProps> = ({ handleSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
      <form onSubmit={(e) => handleSubmit(e, username, password)}>
        <FormControl id="username" isRequired mb={4}>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /> 
        </FormControl>
        
        <FormControl id="password" isRequired mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        
        <Button type="submit" colorScheme="blue">
          Login
        </Button>
      </form>
    </Box>
  );
};