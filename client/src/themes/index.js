import { extendTheme } from "@chakra-ui/react";
import * as globals from "./global";
import { AccordionStyling } from './accordion';
import { ModalStyling } from './modal';
import { CardStyling } from './card';
import { ListStyling } from './list';

export default extendTheme(
  // Pass all themes from ./global
  ...Object.values(globals),
  AccordionStyling,
  ModalStyling,
  CardStyling,
  ListStyling
);
