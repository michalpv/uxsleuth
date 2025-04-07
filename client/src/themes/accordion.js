import { accordionAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  root: {
    p: "0px",
    // display: "block",
    w: "90%",
    backdropFilter: "blur(10px)",
    borderRadius: "10px",
    bg: "blackAlpha.200",
    backgroundClip: "border-box",
  },
  panel: {
    h: "700px",
    overflowY: 'auto'
  },
  container: {
    border: "none",
    _focus: {
      boxShadow: "outline",
    },
  },
  button: {
    color: "gray.500",
    _hover: {
      color: "gray.600",
    },
    _focus: {
      color: "blue.500",
    },
    borderRadius: "20px",
  },
});

const accordionTheme = defineMultiStyleConfig({
  baseStyle
});

export const AccordionStyling = {
  components: {
    Accordion: accordionTheme,
  },
};