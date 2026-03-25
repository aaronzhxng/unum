import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { FamiliarityLevel, useOnboarding } from "../context/OnboardingContext";

const OPTIONS: {
  level: FamiliarityLevel;
  label: string;
  sublabel: string;
}[] = [
  {
    level: "low",
    label: "Not that familiar",
    sublabel: "I'm just getting started with politics",
  },
  {
    level: "mid",
    label: "Mildly familiar",
    sublabel: "I follow the news but want to learn more",
  },
  {
    level: "high",
    label: "Pretty familiar",
    sublabel: "I keep up with legislation and policy",
  },
];

export default function HowFamiliarScreen() {
  const router = useRouter();
  const { familiarityLevel, setFamiliarityLevel, setOverlayConfig } =
    useOnboarding();

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 1,
        continueLabel: "Continue",
        onContinue: () => router.push("/onboarding/pick-policy-areas" as any),
        onBack: () => router.back(),
        continueDisabled: familiarityLevel === null,
        showBorder: false,
      });
    }, [familiarityLevel]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 40 }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 8,
            marginTop: 32,
          }}
        >
          How familiar are you with politics?
        </Text>
        <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
          We'll tailor the experience to what works best for you.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {OPTIONS.map((option) => {
          const isSelected = familiarityLevel === option.level;
          return (
            <Pressable
              key={option.level}
              onPress={() => {
                setFamiliarityLevel(option.level);
              }}
              style={({ pressed }) => ({
                backgroundColor: isSelected ? "#E8F4FF" : "#fff",
                borderRadius: 20,
                padding: 20,
                borderWidth: 2,
                borderColor: isSelected ? "#008CFF" : "transparent",
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              })}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isSelected ? "#008CFF" : "#1a1a1a",
                    marginBottom: 4,
                  }}
                >
                  {option.label}
                </Text>
                <Text style={{ fontSize: 13, color: "#535353" }}>
                  {option.sublabel}
                </Text>
              </View>

              {/* Radio circle */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? "#008CFF" : "#ccc",
                  backgroundColor: isSelected ? "#008CFF" : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 12,
                  flexShrink: 0,
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#fff",
                    }}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
