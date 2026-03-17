import { useRouter } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

const STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function PickStateScreen() {
  const router = useRouter();
  const { priorityState, setPriorityState } = useOnboarding();
  const [showList, setShowList] = useState(false);

  const handleContinue = () => router.push("/onboarding/name-list" as any);
  const handleSkip = () => router.push("/onboarding/name-list" as any);

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Header */}
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 }}
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
          Set a priority state
        </Text>
        <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
          Get notified about new bills introduced by representatives from your
          state.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        {/* State selector button */}
        <Pressable
          onPress={() => setShowList(!showList)}
          style={({ pressed }) => ({
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderColor: priorityState ? "#008CFF" : "#E0E0E0",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          })}
        >
          <Text
            style={{
              fontSize: 16,
              color: priorityState ? "#1a1a1a" : "#999",
              fontWeight: priorityState ? "600" : "400",
            }}
          >
            {priorityState ?? "Select a state..."}
          </Text>
          {priorityState && <Check size={20} color="#008CFF" strokeWidth={3} />}
        </Pressable>

        {/* State list */}
        {showList && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              marginTop: 8,
              maxHeight: 320,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              overflow: "hidden",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled>
              {STATES.map((state) => (
                <Pressable
                  key={state}
                  onPress={() => {
                    setPriorityState(state);
                    setShowList(false);
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f5f5f5",
                    backgroundColor: pressed
                      ? "#f0f8ff"
                      : priorityState === state
                        ? "#E8F4FF"
                        : "#fff",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  })}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: "#1a1a1a",
                      fontWeight: priorityState === state ? "600" : "400",
                    }}
                  >
                    {state}
                  </Text>
                  {priorityState === state && (
                    <Check size={18} color="#008CFF" strokeWidth={3} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Buttons */}
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
        {/* Dot indicators */}
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
                width: i === 4 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 4 ? "#008CFF" : "#D0D0D0",
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
            {priorityState ? `Set ${priorityState}` : "Continue"}
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
