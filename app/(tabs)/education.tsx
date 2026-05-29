import { useRouter } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import EducationOptionsMenu from "../education_tab/EducationOptionsMenu";
import { educationTopics } from "../education_tab/content";
import { styles as componentStyles } from "../global_styles/styles";

export default function EducationScreen() {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={[componentStyles.container, { backgroundColor: "#fafafa" }]}>
      <View style={componentStyles.headerBar}>
        <Text style={componentStyles.header}>Reference Articles</Text>
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

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View>
          {educationTopics.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => router.push(`/education_tab/${topic.id}` as any)}
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
                      source={topic.icon}
                      style={{ width: 50, height: 50 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={componentStyles.name}>{topic.title}</Text>
                  <Text
                    style={componentStyles.subtitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {topic.subtitle}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <EducationOptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        screen="education"
      />
    </View>
  );
}
