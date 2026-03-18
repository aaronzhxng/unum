import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

const TOUR_STEPS = [
  {
    title: "Your Lists",
    description:
      "The home tab is where your lists live. Tap the list name at the top to switch between lists or create new ones.",
    emoji: "🏠",
  },
  {
    title: "Browse Legislation",
    description:
      "The legislation tab shows all bills from the current Congress. Filter by chamber, policy area, or bill type.",
    emoji: "📋",
  },
  {
    title: "Follow Officials",
    description:
      "The officials tab lets you browse all current members of Congress by state. Set a priority state to see your representatives first.",
    emoji: "👤",
  },
  {
    title: "Add to a List",
    description:
      "Tap the + button on any bill or official card to add it to one of your lists. You can add items from any screen.",
    emoji: "➕",
  },
  {
    title: "Set Notifications",
    description:
      "Tap the bell icon on any bill or official detail page to get notified about updates. You can also set notifications for policy areas from the legislation tab.",
    emoji: "🔔",
  },
  {
    title: "You're all set!",
    description:
      "That's everything you need to know. Explore Unum and stay informed about what matters to you.",
    emoji: "🎉",
  },
];

export default function TourScreen() {
  const { setOverlayConfig } = useOnboarding();

  useEffect(() => {
    setOverlayConfig(null);
  }, []);
  const router = useRouter();
  const [step, setStep] = useState(0);

  const isLast = step === TOUR_STEPS.length - 1;
  const current = TOUR_STEPS[step];

  const handleNext = () => {
    if (isLast) {
      router.replace("/(tabs)/home" as any);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Background tap to skip */}
      <Pressable
        style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 80 }}
        onPress={handleNext}
      >
        {/* Tour card */}
        <Pressable
          onPress={() => {}} // prevent background tap from firing
          style={{
            marginHorizontal: 16,
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 28,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Emoji */}
          <Text style={{ fontSize: 48, marginBottom: 16, textAlign: "center" }}>
            {current.emoji}
          </Text>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#1a1a1a",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {current.title}
          </Text>

          {/* Description */}
          <Text
            style={{
              fontSize: 15,
              color: "#535353",
              lineHeight: 22,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {current.description}
          </Text>

          {/* Dot indicators */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            {TOUR_STEPS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === step ? "#008CFF" : "#D0D0D0",
                }}
              />
            ))}
          </View>

          {/* Next / Finish button */}
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({
              backgroundColor: "#008CFF",
              paddingVertical: 16,
              borderRadius: 32,
              alignItems: "center",
              marginBottom: 12,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {isLast ? "Get Started" : "Next"}
            </Text>
          </Pressable>

          {/* Skip */}
          {!isLast && (
            <Pressable
              onPress={handleSkip}
              style={{ alignItems: "center", paddingVertical: 8 }}
            >
              <Text style={{ color: "#535353", fontSize: 15 }}>Skip tour</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </View>
  );
}
