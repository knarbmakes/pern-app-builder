import React, { useState } from 'react';
import { Box, Input, FormControl, FormLabel, Button, Flex, Text, VStack, Container } from '@chakra-ui/react';

type LoginProps = {
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (email: string, password: string, username: string) => Promise<void>;
};

const InputField: React.FC<{
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}> = ({ label, type, value, placeholder, onChange }) => (
  <FormControl isRequired mb={4}>
    <FormLabel>{label}</FormLabel>
    <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  </FormControl>
);

export const Login: React.FC<LoginProps> = ({ handleLogin, handleRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegisterForm, setRegisterForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isRegisterForm ? handleRegister(email, password, username) : handleLogin(email, password);
  };

  return (
    <Container mt="20px">
      <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
        <form onSubmit={handleSubmit}>
          <InputField label="Email" type="email" value={email} placeholder="Enter your email" onChange={setEmail} />
          <InputField
            label="Password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={setPassword}
          />

          {isRegisterForm && (
            <InputField
              label="Name"
              type="text"
              value={username}
              placeholder="Enter your name"
              onChange={setUsername}
            />
          )}

          <VStack spacing={4}>
            <Flex justifyContent="center">
              <Button type="submit" colorScheme={isRegisterForm ? 'green' : 'blue'}>
                {isRegisterForm ? 'Register' : 'Login'}
              </Button>
            </Flex>
            <Text
              as="a"
              color="blue.500"
              cursor="pointer"
              textAlign="center"
              onClick={() => setRegisterForm(!isRegisterForm)}
            >
              {isRegisterForm ? 'Back to Login' : 'Register Account'}
            </Text>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};
