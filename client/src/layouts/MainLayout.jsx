import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from 'src/components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <Box>
      <Box w='80%' h='70vh' m='auto'>
        <Navbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
