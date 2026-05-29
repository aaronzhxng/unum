import { useRouter } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import RichText from "../education_tab/RichText";
import { glossaryBySlug } from "../education_tab/glossary";

interface Props {
  /** Slug of the term to display, or null to hide. */
  slug: string | null;
  onClose: () => void;
  /** Called when a red word inside the definition is tapped — replaces current popup. */
  onNavigateGlossary: (slug: string) => void;
}

/**
 * Tap-outside-to-close popup that shows a single glossary term's definition.
 * Red words inside the definition open a new popup; bold words navigate to the topic.
 */
export default function GlossaryPopup({ slug, onClose, onNavigateGlossary }: Props) {
  const router = useRouter();

  if (!slug) return null;
  const entry = glossaryBySlug[slug];
  if (!entry) return null;

  const handleTopicPress = (topicId: string) => {
    onClose();
    // Small delay so the modal has time to close before navigating
    setTimeout(() => router.push(`/education_tab/${topicId}` as any), 150);
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Tap anywhere outside the card to close */}
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.25)",
        }}
        onPress={onClose}
      >
        {/* Inner pressable prevents card taps from bubbling to the overlay */}
        <Pressable
          onPress={() => {}}
          style={{
            marginHorizontal: 24,
            backgroundColor: "#fafafa",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: 10,
            }}
          >
            {entry.term}
          </Text>
          <ScrollView
            style={{ maxHeight: 280 }}
            showsVerticalScrollIndicator={false}
          >
            <RichText
              segments={entry.definition}
              style={{ fontSize: 14, color: "#535353", lineHeight: 22 }}
              onGlossaryPress={onNavigateGlossary}
              onTopicPress={handleTopicPress}
            />
          </ScrollView>
          <View style={{ alignItems: "flex-end", marginTop: 16 }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 14, color: "#008CFF", fontWeight: "600" }}>
                Done
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
