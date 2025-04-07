import {
  createMultiStyleConfigHelpers,
} from '@chakra-ui/styled-system';
import { listAnatomy as parts } from '@chakra-ui/anatomy';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle((props) => ({
  item: {
    color: "brand.700",
    fontSize: "lg"
  }
}));

const listTheme = defineMultiStyleConfig({ baseStyle });

export const ListStyling = {
  components: {
    List: listTheme,
  },
};