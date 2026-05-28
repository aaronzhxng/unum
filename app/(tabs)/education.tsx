import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";
import { educationTopics } from "../education_tab/content";

export default function EducationScreen() {
  const router = useRouter();

  return (
    <View style={[componentStyles.container, { backgroundColor: "#fafafa" }]}>
      <View style={componentStyles.headerBar}>
        <Text style={componentStyles.header}>Learn the basics</Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 32,
        }}
      >
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
                  { paddingVertical: 16, borderWidth: 2, borderColor: "transparent" },
                ]}
              >
                {/* Icon column — 64px wide, icon 50px */}
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
                {/* Topic Info */}
                <View style={{ flex: 1 }}>
                  <Text style={componentStyles.name}>{topic.title}</Text>
                  <Text style={componentStyles.subtitle}>{topic.subtitle}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
