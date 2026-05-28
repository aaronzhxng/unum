import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { styles as componentStyles } from "../../global_styles/styles";
import { EducationSection, getEducationSubtopic, getEducationTopic } from "../content";

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

  if (!topicData || !subtopicData) {
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
          Article not found
        </Text>
      </View>
    );
  }

  const cardStyle = {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#fafafa",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Header */}
      <View style={[componentStyles.headerBar, { paddingHorizontal: 16 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <ChevronLeft size={24} color="#535353" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 36,
        }}
      >
        {/* Icon + Title */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Image
            source={topicData.icon}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#000000", flex: 1 }}>
            {subtopicData.title}
          </Text>
        </View>

        {/* Body section nodes */}
        {subtopicData.body.map((section: EducationSection, index: number) => {
          if (section.type === "image") {
            if (!section.source) return null;
            const asset = Image.resolveAssetSource(section.source);
            const aspectRatio = asset.width / asset.height;
            return (
              <View
                key={index}
                style={{
                  marginBottom: 12,
                  borderRadius: 24,
                  overflow: "hidden",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Image
                  source={section.source}
                  style={{ width: "100%", aspectRatio }}
                  resizeMode="contain"
                />
                {section.caption && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#7B7C81",
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      lineHeight: 17,
                    }}
                  >
                    {section.caption}
                  </Text>
                )}
              </View>
            );
          }

          if (section.type === "links") {
            return (
              <View key={index} style={cardStyle}>
                {section.heading && (
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#1a1a1a",
                      marginBottom: 12,
                    }}
                  >
                    {section.heading}
                  </Text>
                )}
                {section.items.map((item, i) => (
                  <Pressable
                    key={i}
                    onPress={() => Linking.openURL(item.url)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.6 : 1,
                      marginBottom: i < section.items.length - 1 ? 12 : 0,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#008CFF",
                        lineHeight: 20,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            );
          }

          // type === "text"
          return (
            <View key={index} style={cardStyle}>
              {section.heading && (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1a1a1a",
                    marginBottom: 8,
                  }}
                >
                  {section.heading}
                </Text>
              )}
              <Text style={{ fontSize: 14, color: "#535353", lineHeight: 20 }}>
                {section.content}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
