import { modalAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';
const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'blackAlpha.800',
  },
  dialog: {
    bg: 'brand.500'
  },
  header: {
    color: 'white'
  },
  body: {
    color: 'white'
  }
});

const modalTheme = defineMultiStyleConfig({
  baseStyle,
});

export const ModalStyling = {
  components: {
    Modal: modalTheme,
  },
};
