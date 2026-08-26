import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, ExternalLink, MoreVertical } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  Image,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import GlossaryPopup from "../../global_components/GlossaryPopup";
import { styles as componentStyles } from "../../global_styles/styles";
import EducationOptionsMenu from "../EducationOptionsMenu";
import RichText from "../RichText";
import {
  EducationSection,
  getEducationSubtopic,
  getEducationTopic,
} from "../content";
import { parseRichText } from "../glossary";
import { trySwipeBack } from "../../utils/swipeBackGuard";

const CONTENT_PADDING = 20;

export default function EducationSubtopicScreen() {
  const router = useRouter();
  const { topic, subtopic } = useLocalSearchParams<{
    topic: string;
    subtopic: string;
  }>();
  const topicData = getEducationTopic(String(topic ?? ""));
  const subtopicData = getEducationSubtopic(
    String(topic ?? ""),
    String(subtopic ?? ""),
  );

  const [showOptions, setShowOptions] = useState(false);
  const [activePopupSlug, setActivePopupSlug] = useState<string | null>(null);

  const handleTopicPress = (topicId: string) => {
    setActivePopupSlug(null);
    setTimeout(() => router.push(`/education_tab/${topicId}` as any), 150);
  };

  if (!topicData || !subtopicData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          padding: 20,
          paddingTop: 56,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a" }}>
          Article not found
        </Text>
      </View>
    );
  }

  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  // Index of the first "text" section — rendered as a lead paragraph
  const leadIndex = subtopicData.body.findIndex((s) => s.type === "text");

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

  const currentIndex = topicData.subtopics.findIndex(
    (s) => s.id === String(subtopic ?? ""),
  );
  const prevSubtopic =
    currentIndex > 0 ? topicData.subtopics[currentIndex - 1] : null;
  const nextSubtopic =
    currentIndex >= 0 && currentIndex < topicData.subtopics.length - 1
      ? topicData.subtopics[currentIndex + 1]
      : null;

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
      {/* ── Nav bar ── */}
      <View
        style={[
          componentStyles.headerBar,
          { paddingHorizontal: 16, backgroundColor: "#fff", marginBottom: 12 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <ChevronLeft size={24} color="#535353" />
        </Pressable>
        <Pressable
          onPress={() => setShowOptions(true)}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <MoreVertical size={24} color="#535353" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 56 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero / title block ── */}
        <View
          style={{
            paddingHorizontal: CONTENT_PADDING,
            paddingTop: 16,
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Icon — subtopic-specific if available, else topic icon */}
          <Image
            source={subtopicData.icon ?? topicData.icon}
            style={{ width: 72, height: 72, flexShrink: 0 }}
            resizeMode="contain"
          />

          {/* Topic breadcrumb + subtopic title stacked */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#008CFF",
                letterSpacing: 0.8,
                marginBottom: 4,
              }}
            >
              {topicData.title.toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#0d0d0d",
                lineHeight: 29,
              }}
            >
              {subtopicData.title}
            </Text>
          </View>
        </View>

        {/* Thin rule */}
        <View
          style={{
            height: 1,
            backgroundColor: "#e8e8e8",
            marginHorizontal: CONTENT_PADDING,
            marginBottom: 28,
          }}
        />

        {/* ── Body sections ── */}
        {subtopicData.body.map((section: EducationSection, index: number) => {
          /* ── Image ── */
          if (section.type === "image") {
            if (!section.source) return null;
            const asset = Image.resolveAssetSource(section.source);
            const imgWidth = SCREEN_WIDTH - CONTENT_PADDING * 2;
            const imgHeight = (asset.height / asset.width) * imgWidth;

            return (
              <View
                key={index}
                style={{
                  marginHorizontal: CONTENT_PADDING,
                  marginBottom: 28,
                }}
              >
                <View
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: section.transparent
                      ? "transparent"
                      : "#f0f0f0",
                  }}
                >
                  <Image
                    source={section.source}
                    style={{ width: imgWidth, height: imgHeight }}
                    resizeMode="cover"
                  />
                </View>
                {section.caption ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#8a8a8a",
                      lineHeight: 18,
                      marginTop: 8,
                      paddingHorizontal: 2,
                    }}
                  >
                    {section.caption}
                  </Text>
                ) : null}
              </View>
            );
          }

          /* ── Callout ── */
          if (section.type === "callout") {
            return (
              <View
                key={index}
                style={{
                  marginHorizontal: CONTENT_PADDING,
                  marginBottom: 28,
                  backgroundColor: "#EFF7FF",
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                }}
              >
                {section.heading ? (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#008CFF",
                      letterSpacing: 0.8,
                      marginBottom: 6,
                    }}
                  >
                    {section.heading.toUpperCase()}
                  </Text>
                ) : null}
                <RichText
                  segments={parseRichText(
                    section.content,
                    subtopic === "senate-leadership" ||
                      subtopic === "house-leadership"
                      ? [
                          "vice-president",
                          "majority-party",
                          "trifecta",
                          "president",
                        ]
                      : undefined,
                  )}
                  style={{
                    fontSize: 15,
                    color: "#1a3a5c",
                    lineHeight: 24,
                    fontWeight: "500",
                  }}
                  onGlossaryPress={setActivePopupSlug}
                  onTopicPress={handleTopicPress}
                />
              </View>
            );
          }

          /* ── Links ── */
          if (section.type === "links") {
            return (
              <View
                key={index}
                style={{
                  marginHorizontal: CONTENT_PADDING,
                  marginBottom: 28,
                }}
              >
                {/* Divider above the resources block */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#e8e8e8",
                    marginBottom: 18,
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#8a8a8a",
                    letterSpacing: 0.9,
                    marginBottom: 14,
                  }}
                >
                  {section.heading
                    ? section.heading.toUpperCase()
                    : "LEARN MORE"}
                </Text>
                {section.items.map((item, i) => (
                  <Pressable
                    key={i}
                    onPress={() => Linking.openURL(item.url)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.55 : 1,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 9,
                      paddingVertical: 9,
                      borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                      borderBottomColor: "#f0f0f0",
                    })}
                  >
                    <View style={{ marginTop: 4 }}>
                      <ExternalLink size={13} color="#008CFF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#008CFF",
                        lineHeight: 22,
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            );
          }

          /* ── List ── */
          if (section.type === "list") {
            return (
              <View
                key={index}
                style={{ marginHorizontal: CONTENT_PADDING, marginBottom: 28 }}
              >
                {section.items.map((item, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: i < section.items.length - 1 ? 12 : 0,
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
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#0d0d0d",
                        lineHeight: 22,
                        flex: 1,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }

          /* ── Text (default) ── */
          const isLead = index === leadIndex;
          return (
            <View
              key={index}
              style={{
                marginHorizontal: CONTENT_PADDING,
                marginBottom: 28,
              }}
            >
              {section.heading ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  {/* Colored left accent bar */}
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
                    {section.heading}
                  </Text>
                </View>
              ) : null}

              <RichText
                segments={parseRichText(
                  section.content,
                  subtopic === "senate-leadership" ||
                    subtopic === "house-leadership"
                    ? [
                        "vice-president",
                        "majority-party",
                        "trifecta",
                        "president",
                      ]
                    : undefined,
                )}
                style={{
                  fontSize: isLead ? 16 : 15,
                  color: "#444",
                  lineHeight: isLead ? 27 : 26,
                }}
                onGlossaryPress={setActivePopupSlug}
                onTopicPress={handleTopicPress}
              />
            </View>
          );
        })}

        {prevSubtopic && (
          <Pressable
            onPress={() =>
              router.replace(
                `/education_tab/${topic}/${prevSubtopic.id}` as any,
              )
            }
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: CONTENT_PADDING,
              paddingVertical: 20,
              borderTopWidth: 1,
              borderTopColor: "#e8e8e8",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ChevronLeft size={18} color="#008CFF" />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                flex: 1,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#0d0d0d" }}>Read Previous: </Text>
              <Text style={{ color: "#008CFF" }}>{prevSubtopic.title}</Text>
            </Text>
          </Pressable>
        )}
        {nextSubtopic && (
          <Pressable
            onPress={() =>
              router.replace(
                `/education_tab/${topic}/${nextSubtopic.id}` as any,
              )
            }
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: CONTENT_PADDING,
              paddingVertical: 20,
              borderTopWidth: prevSubtopic ? 0 : 1,
              borderTopColor: "#e8e8e8",
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ChevronRight size={18} color="#008CFF" />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                flex: 1,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#0d0d0d" }}>Read Next: </Text>
              <Text style={{ color: "#008CFF" }}>{nextSubtopic.title}</Text>
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <EducationOptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        screen={`education-subtopic/${topic}/${subtopic}`}
      />

      <GlossaryPopup
        slug={activePopupSlug}
        onClose={() => setActivePopupSlug(null)}
        onNavigateGlossary={setActivePopupSlug}
      />
    </View>
  );
}
