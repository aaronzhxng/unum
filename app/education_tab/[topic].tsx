import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import EducationOptionsMenu from "./EducationOptionsMenu";
import { getEducationTopic } from "./content";
import { styles as componentStyles } from "../global_styles/styles";
import { trySwipeBack } from "../utils/swipeBackGuard";

export default function EducationTopicScreen() {
  const router = useRouter();
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const topicData = getEducationTopic(String(topic ?? ""));
  const [showOptions, setShowOptions] = useState(false);

  if (!topicData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fafafa",
          padding: 20,
          paddingTop: 56,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a" }}>
          Topic not found
        </Text>
      </View>
    );
  }

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
  // double-popping past the topic list straight to the tab.
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
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
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
      <View style={[componentStyles.headerBar, { paddingHorizontal: 16, marginBottom: 12 }]}>
        <View style={[componentStyles.headerLeft, { flex: 1, marginRight: 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <ChevronLeft size={24} color="#535353" />
          </Pressable>
          <Text
            style={[componentStyles.header, { marginBottom: 0, flexShrink: 1 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {topicData.title}
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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        {topicData.subtopics.map((subtopic) => (
          <Pressable
            key={subtopic.id}
            onPress={() =>
              router.push(
                `/education_tab/${topicData.id}/${subtopic.id}` as any,
              )
            }
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              borderRadius: 48,
            })}
          >
            <View
              style={[
                componentStyles.officialCard,
                {
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: "transparent",
                },
              ]}
            >
              <View
                style={{
                  width: 64,
                  marginRight: 12,
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ width: 50, height: 50 }}>
                  <Image
                    source={subtopic.icon ?? topicData.icon}
                    style={{ width: 50, height: 50 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={componentStyles.name}>{subtopic.title}</Text>
                <Text style={componentStyles.subtitle}>
                  {subtopic.summary}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <EducationOptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        screen={`education-topic/${topicData.id}`}
      />
    </View>
  );
}
