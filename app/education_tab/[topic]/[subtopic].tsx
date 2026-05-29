import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ExternalLink, MoreVertical } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import EducationOptionsMenu from "../EducationOptionsMenu";
import RichText from "../RichText";
import {
  EducationSection,
  getEducationSubtopic,
  getEducationTopic,
} from "../content";
import { parseRichText } from "../glossary";
import GlossaryPopup from "../../global_components/GlossaryPopup";
import { styles as componentStyles } from "../../global_styles/styles";

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ── Nav bar ── */}
      <View
        style={[
          componentStyles.headerBar,
          { paddingHorizontal: 16, backgroundColor: "#fff" },
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
          }}
        >
          {/* Topic breadcrumb — text only, no icon */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#008CFF",
              letterSpacing: 0.8,
              marginBottom: 10,
            }}
          >
            {topicData.title.toUpperCase()}
          </Text>

          {/* Icon + article title row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Image
              source={topicData.icon}
              style={{ width: 50, height: 50, flexShrink: 0 }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#0d0d0d",
                lineHeight: 32,
                flex: 1,
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
                    backgroundColor: "#f0f0f0",
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
                  borderLeftWidth: 3,
                  borderLeftColor: "#008CFF",
                  borderRadius: 10,
                  paddingVertical: 14,
                  paddingRight: 16,
                  paddingLeft: 14,
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
                  segments={parseRichText(section.content)}
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
                segments={parseRichText(section.content)}
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
