import React from 'react';
import { Box, Card, Flex, Text, HStack, Link } from '@chakra-ui/react';

const Navbar = ({ ...rest }) => {
  return (
    <Box
      px={4}
      py={3}
      w="80%"
      m="auto"
      backdropFilter="blur(10px)"
      bg="blackAlpha.300"
      borderRadius="0 0 10px 10px"
      position="sticky"
      top="0" // Needed to stick to the top of the viewport
      zIndex="10" // Higher index to ensure it's above other content
      {...rest}
    >
      <Flex justify="space-between" align="center">
        <Text fontSize="xl">UX Sleuth</Text>
        <HStack spacing={4}>
          <Link href="/home">Home</Link>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
