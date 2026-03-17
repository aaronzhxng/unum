import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
  const { selectedPolicyAreas, setSelectedPolicyAreas } = useOnboarding();

  const toggle = (area: string) => {
    setSelectedPolicyAreas(
      selectedPolicyAreas.includes(area)
        ? selectedPolicyAreas.filter((a) => a !== area)
        : [...selectedPolicyAreas, area],
    );
  };

  const handleContinue = () => router.push("/onboarding/pick-state" as any);
  const handleSkip = () => router.push("/onboarding/pick-state" as any);

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 16 }}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <ChevronLeft size={28} color="#535353" />
        </Pressable>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 8,
          }}
        >
          Pick policy areas
        </Text>
        <Text style={{ fontSize: 15, color: "#535353" }}>
          Get notified when new bills are introduced in areas you care about.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 180 }}
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
                }}
              >
                {area}
              </Text>
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
                }}
              >
                {isSelected && (
                  <Text
                    style={{ color: "white", fontSize: 14, fontWeight: "700" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fafafa",
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: i === 3 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 3 ? "#008CFF" : "#D0D0D0",
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={handleContinue}
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
            {selectedPolicyAreas.length > 0
              ? `Add ${selectedPolicyAreas.length} Area${selectedPolicyAreas.length > 1 ? "s" : ""}`
              : "Continue"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSkip}
          style={{ alignItems: "center", paddingVertical: 8 }}
        >
          <Text style={{ color: "#535353", fontSize: 15 }}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
