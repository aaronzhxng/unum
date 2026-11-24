import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Text, TextStyle } from "react-native";
import { GlossarySegment } from "./glossary";

interface Props {
  segments: GlossarySegment[];
  style?: TextStyle;
  onGlossaryPress: (slug: string) => void;
  onTopicPress: (topicId: string) => void;
  /** Called after a long press copies the paragraph on iPhone */
  onCopied?: () => void;
}

// iPhones can only copy a whole block of selectable text, with nothing
// highlighted, so there a long press copies the paragraph and shows what was
// copied instead. Android keeps normal text selection.
const COPY_BY_PRESS = Platform.OS === "ios";

/**
 * Renders an array of GlossarySegments as inline React Native Text.
 * - glossary segments → red, opens definition popup
 * - topic segments    → blue bold, navigates to education topic
 * - plain segments    → unstyled
 */
export default function RichText({
  segments,
  style,
  onGlossaryPress,
  onTopicPress,
  onCopied,
}: Props) {
  const [flash, setFlash] = useState(false);
  const copy = async () => {
    await Clipboard.setStringAsync(segments.map((seg) => seg.text).join(""));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    onCopied?.();
  };
  // Glossary terms still open on a tap
  return (
    <Text
      style={[style, flash && { backgroundColor: "#E8F4FF" }]}
      selectable={!COPY_BY_PRESS}
      onLongPress={COPY_BY_PRESS ? copy : undefined}
      suppressHighlighting
    >
      {segments.map((seg, i) => {
        if (seg.type === "glossary") {
          return (
            <Text
              key={i}
              style={{ color: "#FF3B30" }}
              onPress={() => onGlossaryPress(seg.slug)}
            >
              {seg.text}
            </Text>
          );
        }
        // if (seg.type === "topic") {
        //   return (
        //     <Text
        //       key={i}
        //       style={{ fontWeight: "700", color: "#1a1a1a", textDecorationLine: "underline" }}
        //       onPress={() => onTopicPress(seg.topicId)}
        //     >
        //       {seg.text}
        //     </Text>
        //   );
        // }
        if (seg.type === "topic") {
          return <Text key={i}>{seg.text}</Text>;
        }
        return <Text key={i}>{seg.text}</Text>;
      })}
    </Text>
  );
}
