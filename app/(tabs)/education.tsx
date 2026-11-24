import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MoreVertical, Search } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTour } from "../context/TourContext";
import EducationOptionsMenu from "../education_tab/EducationOptionsMenu";
import EducationSearchModal from "../education_tab/EducationSearchModal";
import { visibleEducationTopics } from "../education_tab/content";
import { styles as componentStyles } from "../global_styles/styles";
import { trySwipeBack } from "../utils/swipeBackGuard";

export default function EducationScreen() {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Reopens the search, as it was, when coming back from an article it opened
  const searchNavigatedAwayRef = useRef(false);
  const [searchInstantOpen, setSearchInstantOpen] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (searchNavigatedAwayRef.current) {
        searchNavigatedAwayRef.current = false;
        setSearchInstantOpen(true);
        setShowSearch(true);
      }
    }, []),
  );
  const { isActive, currentStep, setTargetLayout } = useTour();
  const firstTopicRef = useRef<View>(null);

  useEffect(() => {
    if (isActive && currentStep === 7) {
      setTimeout(() => {
        firstTopicRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
  }, [isActive, currentStep]);

  // Claim the OS-level back gesture so it goes to the home tab instead of
  // closing the app — gated by the shared cooldown so a single gesture
  // (which can fire hardwareBackPress more than once) only navigates once.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (trySwipeBack()) router.push("/(tabs)/home" as any);
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  return (
    <View style={[componentStyles.container, { backgroundColor: "#fafafa" }]}>
      <View style={componentStyles.headerBar}>
        <Text style={[componentStyles.header, { flexShrink: 1 }]}>
          Education Articles
        </Text>
        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => {
              setSearchInstantOpen(false);
              setShowSearch(true);
            }}
            accessibilityLabel="Search articles"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Search size={24} color="#535353" />
          </Pressable>
          <Pressable
            onPress={() => setShowOptions(true)}
            accessibilityLabel="More options"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View>
          {visibleEducationTopics.map((topic, index) => (
            <View
              key={topic.id}
              ref={index === 0 ? firstTopicRef : undefined}
              collapsable={false}
            >
              <Pressable
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
                    <Text style={componentStyles.subtitle}>
                      {topic.subtitle}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() => router.push("/glossary" as any)}
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
                    source={require("../../assets/education_icons/glossary.png")}
                    style={{ width: 50, height: 50 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={componentStyles.name}>Glossary</Text>
                <Text style={componentStyles.subtitle}>
                  Definitions for political and legislative terms used across
                  the app.
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <EducationSearchModal
        isVisible={showSearch}
        skipEntryAnimation={searchInstantOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={() => {
          setSearchInstantOpen(false);
          setShowSearch(false);
        }}
        onNavigatingAway={() => {
          searchNavigatedAwayRef.current = true;
          setShowSearch(false);
        }}
        onOpenArticle={(topicId, subtopicId) =>
          router.push(`/education_tab/${topicId}/${subtopicId}` as any)
        }
      />

      <EducationOptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        screen="education"
      />
    </View>
  );
}
