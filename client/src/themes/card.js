import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(10px)",
    width: "100%",
    borderRadius: "10px",
    bg: "blackAlpha.300",
    backgroundClip: "border-box",
    p: '20px'
  },
  // header: {
  //   paddingBottom: '2px',
  // },
  // body: {
  //   paddingTop: '2px',
  // },
  // footer: {
  //   paddingTop: '2px',
  // },
});

const cardTheme = defineMultiStyleConfig({ baseStyle });

export const CardStyling = {
  components: {
    Card: cardTheme,
  },
};
