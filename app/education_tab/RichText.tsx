import React from "react";
import { Text, TextStyle } from "react-native";
import { GlossarySegment } from "./glossary";

interface Props {
  segments: GlossarySegment[];
  style?: TextStyle;
  onGlossaryPress: (slug: string) => void;
  onTopicPress: (topicId: string) => void;
}

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
}: Props) {
  return (
    <Text style={style}>
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
