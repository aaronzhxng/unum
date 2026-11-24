import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { getEducationTopic } from "./content";

export default function EducationTopicScreen() {
  const router = useRouter();
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const topicData = getEducationTopic(String(topic ?? ""));

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 32,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: "#6b6b6b" }}>Back</Text>
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
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
            }}
          >
            <Image
              source={topicData.icon}
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#1a1a1a" }}>
              {topicData.title}
            </Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: "#6b6b6b" }}>
              {topicData.subtitle}
            </Text>
          </View>
        </View>

        {topicData.subtopics.map((subtopic) => (
          <Pressable
            key={subtopic.id}
            onPress={() =>
              router.push(
                `/education_tab/${topicData.id}/${subtopic.id}` as any,
              )
            }
            style={({ pressed }) => ({
              backgroundColor: "#fff",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#ececec",
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              transform: [{ scale: pressed ? 0.985 : 1 }],
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 1,
            })}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: "#f4f4f1",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={topicData.icon}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#1f1f1f" }}
              >
                {subtopic.title}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  lineHeight: 18,
                  color: "#787878",
                }}
              >
                {subtopic.summary}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
