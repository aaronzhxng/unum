import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

const POLICY_AREAS = [
  "Agriculture and Food",
  "Animals",
  "Armed Forces and National Security",
  "Arts, Culture, Religion",
  "Civil Rights and Liberties, Minority Issues",
  "Commerce",
  "Congress",
  "Crime and Law Enforcement",
  "Economics and Public Finance",
  "Education",
  "Emergency Management",
  "Energy",
  "Environmental Protection",
  "Families",
  "Finance and Financial Sector",
  "Foreign Trade and International Finance",
  "Government Operations and Politics",
  "Health",
  "Housing and Community Development",
  "Immigration",
  "International Affairs",
  "Labor and Employment",
  "Law",
  "Native Americans",
  "Public Lands and Natural Resources",
  "Science, Technology, Communications",
  "Social Welfare",
  "Sports and Recreation",
  "Taxation",
  "Transportation and Public Works",
  "Water Resources Development",
];

export default function PickPolicyAreasScreen() {
  const router = useRouter();
  const {
    selectedPolicyAreas,
    setSelectedPolicyAreas,
    setOverlayConfig,
    familiarityLevel,
  } = useOnboarding();

  const toggle = (area: string) => {
    setSelectedPolicyAreas(
      selectedPolicyAreas.includes(area)
        ? selectedPolicyAreas.filter((a) => a !== area)
        : [...selectedPolicyAreas, area],
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 2,
        continueLabel:
          selectedPolicyAreas.length > 0
            ? `Add ${selectedPolicyAreas.length} Area${selectedPolicyAreas.length > 1 ? "s" : ""}`
            : "Continue",
        continueDisabled: selectedPolicyAreas.length === 0,
        onContinue: () => router.push("/onboarding/pick-state" as any),
        onBack: () => router.back(),
        onSkip: () => {
          setSelectedPolicyAreas([]);
          router.push("/onboarding/pick-state" as any);
        },
      });
    }, [selectedPolicyAreas]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 16 }}
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
          Pick policy areas
        </Text>
        <Text style={{ fontSize: 15, color: "#535353" }}>
          {familiarityLevel === "low"
            ? "All bills have a policy area they are sorted into. Which ones matter to YOU most? We will notify you when a bill in this category is introduced or has an update."
            : familiarityLevel === "high"
              ? "Select the policy areas you want to actively follow. We will notify you when a bill in this category is introduced or has an update."
              : "Get notified when major new bills are introduced in areas you care about. We will notify you when a bill in this category is introduced or has an update."}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        {POLICY_AREAS.map((area) => {
          const isSelected = selectedPolicyAreas.includes(area);
          return (
            <Pressable
              key={area}
              onPress={() => toggle(area)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isSelected ? "#E8F4FF" : "#fafafa",
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: isSelected ? "#008CFF" : "transparent",
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: "#000000",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 2,
              })}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: isSelected ? "600" : "400",
                  color: isSelected ? "#008CFF" : "#1a1a1a",
                  flex: 1,
                  marginRight: 12,
                }}
              >
                {area}
              </Text>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isSelected ? "#008CFF" : "#ccc",
                  backgroundColor: isSelected ? "#008CFF" : "transparent",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isSelected && (
                  <Text
                    style={{ color: "white", fontSize: 13, fontWeight: "700" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
