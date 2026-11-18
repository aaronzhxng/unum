import { Info } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import GlossaryPopup from "./GlossaryPopup";

interface Props {
  /** The glossary entry to show */
  slug: string;
  /** What a screen reader says, like "What is a cosponsor?" */
  label: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A small ⓘ beside a heading. Tapping it opens the term's definition, and
 * from there its article, without leaving the page.
 */
export default function InfoButton({ slug, label, style }: Props) {
  const [shown, setShown] = useState<string | null>(null);
  return (
    <>
      <Pressable
        onPress={() => setShown(slug)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          {
            marginLeft: 6,
            // Centered on the text beside it, then a point lower, where
            // mostly lowercase words look centered
            alignSelf: "center",
            justifyContent: "center",
            transform: [{ translateY: 1 }],
            opacity: pressed ? 0.5 : 1,
          },
          style,
        ]}
      >
        <Info size={16} color="#7B7C81" />
      </Pressable>
      <GlossaryPopup
        slug={shown}
        onClose={() => setShown(null)}
        onNavigateGlossary={setShown}
      />
    </>
  );
}
