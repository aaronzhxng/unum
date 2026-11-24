import { useState } from "react";
import { LayoutChangeEvent } from "react-native";

/**
 * For a wrapping row of two parts: tells whether the second has dropped onto
 * its own line, as happens with large system text. Anything starting below
 * the middle of the first part is on a line of its own, whatever margins the
 * wrapped part then gets. Pass onFirstLayout and
 * onSecondLayout to the two parts' onLayout.
 */
export function useWrapped() {
  const [first, setFirst] = useState<{ y: number; height: number } | null>(
    null,
  );
  const [secondY, setSecondY] = useState<number | null>(null);
  const wrapped =
    !!first && secondY != null && secondY > first.y + first.height / 2;
  return {
    wrapped,
    onFirstLayout: (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      setFirst({ y, height });
    },
    onSecondLayout: (e: LayoutChangeEvent) =>
      setSecondY(e.nativeEvent.layout.y),
  };
}
