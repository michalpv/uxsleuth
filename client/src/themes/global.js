import bgImage from "src/assets/noisyGradient.png";
import { defineStyleConfig } from '@chakra-ui/react';

// https://coolors.co/5dd9c1-acfcd9-131338-29256a-100d22-b084cc
// https://coolors.co/5dd9c1-acfcd9-131338-100d22-b084cc

// Brand colours:
export const global = {
  colors: {
    brand: {
      100: "#5DD9C1",
      200: "#ACFCD9",
      300: "#131338",
      400: "#29256A",
      500: "#100D22",
      600: "#B084CC",
      700: "#FFFFFF",
      // 700: "#5DD9C1",
      // 800: "#5DD9C1",
      // 900: "#5DD9C1",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        fontFamily: "Raleway",
        bgImage,
        // backgroundColor: "brand.500",
        bgSize: "cover",
        backgroundAttachment: "fixed",
      },
    }),
  },
};

const Text = defineStyleConfig({
  baseStyle: {
    color: "brand.700",
    fontSize: "lg"
  }
});

export const TextStyling = {
  components: {
    Text
  },
};

const Link = defineStyleConfig({
  baseStyle: {
    color: "brand.700"
  }
});

export const LinkStyling = {
  components: {
    Link,
  },
};