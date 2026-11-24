import { PixelRatio } from "react-native";

// How many lines a bill card's title gets: two normally, three when the
// phone's text size is turned up, so large text shows as much of the title
export const billTitleLines = (): number =>
  PixelRatio.getFontScale() > 1 ? 3 : 2;
