import { useRouter } from "expo-router";
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import EducationOptionsMenu from "./education_tab/EducationOptionsMenu";
import RichText from "./education_tab/RichText";
import { capitalizeFirst, glossaryEntries } from "./education_tab/glossary";
import GlossaryPopup from "./global_components/GlossaryPopup";
import { styles as componentStyles } from "./global_styles/styles";
import { trySwipeBack } from "./utils/swipeBackGuard";

export default function GlossaryScreen() {
  const router = useRouter();
  const [activePopupSlug, setActivePopupSlug] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleTopicPress = (topicId: string) => {
    setActivePopupSlug(null);
    setTimeout(() => router.push(`/education_tab/${topicId}` as any), 150);
  };

  const backSwipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 50 && Math.abs(g.vx) > 0.3 && trySwipeBack()) router.back();
      },
    }),
  ).current;

  // Claim the OS-level back gesture too — otherwise it falls through to the
  // default navigation handler and pops alongside the strip's router.back(),
  // double-popping straight to the tab.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (trySwipeBack()) router.back();
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Left-edge swipe strip — matches router.back() like the back button */}
      <View
        {...backSwipePanResponder.panHandlers}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 20,
          zIndex: 10,
        }}
      />
      {/* Header */}
      <View
        style={[
          componentStyles.headerBar,
          { paddingHorizontal: 16, marginBottom: 4 },
        ]}
      >
        <View style={componentStyles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <ChevronLeft size={24} color="#535353" />
          </Pressable>
          <Text style={[componentStyles.header, { marginBottom: 0 }]}>
            Glossary
          </Text>
        </View>
        <View style={[componentStyles.headerRight, { marginBottom: 0 }]}>
          <Pressable
            onPress={() => setShowOptions(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <Text
          style={{
            fontSize: 13,
            color: "#7B7C81",
            marginTop: 12,
            marginBottom: 20,
            lineHeight: 18,
          }}
        >
          Important words used when talking about U.S. government and politics.
          Tap a <Text style={{ color: "#FF3B30" }}>red word</Text> for its
          definition.
          {/* , or a{" "}
          <Text style={{ fontWeight: "700", color: "#1a1a1a", textDecorationLine: "underline" }}>bold word</Text>{" "}
          to go to that topic. */}
        </Text>

        {glossaryEntries.map((entry) => (
          <View key={entry.slug} style={{ marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 3,
                  borderRadius: 2,
                  backgroundColor: "#008CFF",
                  alignSelf: "stretch",
                }}
              />
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#0d0d0d",
                  lineHeight: 24,
                  flex: 1,
                }}
              >
                {entry.term}
              </Text>
            </View>
            <RichText
              segments={capitalizeFirst(entry.definition)}
              style={{ fontSize: 15, color: "#444", lineHeight: 26 }}
              onGlossaryPress={setActivePopupSlug}
              onTopicPress={handleTopicPress}
            />
          </View>
        ))}
      </ScrollView>

      <EducationOptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        screen="glossary"
      />

      <GlossaryPopup
        slug={activePopupSlug}
        onClose={() => setActivePopupSlug(null)}
        onNavigateGlossary={setActivePopupSlug}
      />
    </View>
  );
}
