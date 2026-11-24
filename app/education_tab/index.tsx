import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { educationTopics } from "./content";

export default function EducationTopicsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f3" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 32,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#7c7c7c" }}>
          EDU TOPICS
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontSize: 30,
            fontWeight: "800",
            color: "#151515",
          }}
        >
          Learn the basics
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: 15,
            lineHeight: 21,
            color: "#666",
            maxWidth: 520,
          }}
        >
          Pick a topic to open its subtopics, then tap into a lesson.
        </Text>

        <View style={{ marginTop: 24, gap: 12 }}>
          {educationTopics.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => router.push(`/education_tab/${topic.id}` as any)}
              style={({ pressed }) => ({
                backgroundColor: "#fff",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#ecebe7",
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  backgroundColor: "#f4f4f1",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  source={topic.icon}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: "#1a1a1a",
                  }}
                >
                  {topic.title}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 13.5,
                    lineHeight: 18,
                    color: "#6f6f6f",
                  }}
                >
                  {topic.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
