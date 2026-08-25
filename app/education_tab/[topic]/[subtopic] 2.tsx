import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";
import { getEducationSubtopic, getEducationTopic } from "../content";

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 36,
        }}
      >
        <Text
          onPress={() => router.back()}
          style={{ marginBottom: 14, fontSize: 14, color: "#6b6b6b" }}
        >
          Back
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#ececec",
              overflow: "hidden",
            }}
          >
            <Image
              source={topicData.icon}
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: "#8a8a8a", marginBottom: 4 }}>
              {topicData.title}
            </Text>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#1a1a1a" }}>
              {subtopicData.title}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#ececec",
            padding: 18,
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                backgroundColor: "#f4f4f1",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={topicData.icon}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#777" }}>
              Lesson
            </Text>
          </View>

          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: "#3b3b3b",
              marginBottom: 14,
            }}
          >
            {subtopicData.summary}
          </Text>

          {subtopicData.body.map((paragraph, index) => (
            <Text
              key={index}
              style={{
                fontSize: 15,
                lineHeight: 23,
                color: "#1f1f1f",
                marginBottom: index === subtopicData.body.length - 1 ? 0 : 12,
              }}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
