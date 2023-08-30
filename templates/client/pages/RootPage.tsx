// RootElement.tsx

import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';

export const RootPage: React.FC = () => {
  return (
    <Flex direction="row">
      <Sidebar />
      <Flex w="100%">
        <Outlet />
      </Flex>
    </Flex>
  );
};
