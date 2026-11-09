import React, { useEffect, useState, type RefObject } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { AddressSuggestion } from "../services/addressSuggestions";

// windowTop is the same top edge in window coordinates, for measuring the
// room left above the keyboard
type Anchor = { top: number; left: number; width: number; windowTop: number };

// Window y of the keyboard's top edge, or null while it's hidden
function useKeyboardTop(): number | null {
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (event) =>
      setKeyboardTop(event.endCoordinates.screenY),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardTop(null),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardTop;
}

// Where to float the dropdown: just under anchorRef, in rootRef's coordinates.
// The dropdown renders as a child of the screen's root view rather than under
// the search bar itself, because Android ignores taps on an absolutely
// positioned view that extends outside its parent's bounds.
export function useDropdownAnchor(
  anchorRef: RefObject<View | null>,
  rootRef: RefObject<View | null>,
  open: boolean,
): Anchor | null {
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  useEffect(() => {
    if (!open) return;
    const anchorView = anchorRef.current;
    const root = rootRef.current;
    if (!anchorView || !root) return;
    root.measureInWindow((rootX, rootY) => {
      anchorView.measureInWindow((x, y, width, height) => {
        setAnchor({
          top: y - rootY + height + 8,
          left: x - rootX,
          width,
          windowTop: y + height + 8,
        });
      });
    });
  }, [open, anchorRef, rootRef]);

  return open ? anchor : null;
}

type Props = {
  suggestions: AddressSuggestion[];
  anchor: Anchor | null;
  onPick: (suggestion: AddressSuggestion) => void;
};

// Floating suggestion dropdown. Render it as the last child of the screen's
// root view so it draws over everything else.
export default function AddressSuggestionList({
  suggestions,
  anchor,
  onPick,
}: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const keyboardTop = useKeyboardTop();

  if (!anchor || suggestions.length === 0) return null;

  // On short screens the keyboard covers the lower suggestions, so stop the
  // list above it and let it scroll
  const maxHeight = Math.max(
    120,
    (keyboardTop ?? windowHeight) - anchor.windowTop - 8,
  );

  return (
    <View
      style={{
        position: "absolute",
        top: anchor.top,
        left: anchor.left,
        width: anchor.width,
        maxHeight,
        zIndex: 20,
        elevation: 8,
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        overflow: "hidden",
      }}
    >
      <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
        {suggestions.map((suggestion, index) => (
          <Pressable
            key={suggestion.id}
            onPress={() => onPick(suggestion)}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
              borderBottomColor: "#f5f5f5",
              backgroundColor: pressed ? "#f0f8ff" : "#fff",
            })}
          >
            <Text style={{ fontSize: 15, color: "#1a1a1a" }} numberOfLines={1}>
              {suggestion.street}
            </Text>
            {!!suggestion.place && (
              <Text
                style={{ fontSize: 13, color: "#7B7C81", marginTop: 2 }}
                numberOfLines={1}
              >
                {suggestion.place}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
