import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import EducationOptionsMenu from "./EducationOptionsMenu";
import { getEducationTopic } from "./content";
import { styles as componentStyles } from "../global_styles/styles";

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Header */}
      <View style={[componentStyles.headerBar, { paddingHorizontal: 16 }]}>
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
            {topicData.title}
          </Text>
        </View>
        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => setShowOptions(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
              marginBottom: 16,
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
                    source={topicData.icon}
                    style={{ width: 50, height: 50 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={componentStyles.name}>{subtopic.title}</Text>
                <Text
                  style={componentStyles.subtitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
