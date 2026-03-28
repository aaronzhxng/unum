import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
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
  const {
    priorityState,
    setPriorityState,
    setOverlayConfig,
    familiarityLevel,
  } = useOnboarding();
  const [showList, setShowList] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 3,
        continueLabel: priorityState ? `Set ${priorityState}` : "Continue",
        continueDisabled: !priorityState,
        onContinue: () => router.push("/onboarding/pick-rep" as any),
        onBack: () => router.back(),
        onSkip: () => {
          setPriorityState(null);
          router.push("/onboarding/pick-rep" as any);
        },
      });
    }, [priorityState]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 }}
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
          Set a priority state
        </Text>
        <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
          {familiarityLevel === "low"
            ? "Every state has two senators and several representatives in Congress. Pick yours to follow what they're working on. Their work is meant to amplify your state's needs on a national level."
            : familiarityLevel === "high"
              ? "Set a priority state to track legislative activity from your delegation."
              : "Get notified about new bills introduced by senator and representatives from your state."}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <Pressable
          onPress={() => setShowList(!showList)}
          style={({ pressed }) => ({
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
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
              fontSize: 16,
              color: priorityState ? "#1a1a1a" : "#999",
              fontWeight: priorityState ? "600" : "400",
            }}
          >
            {priorityState ?? "Select a state..."}
          </Text>
          {priorityState && <Check size={20} color="#008CFF" strokeWidth={3} />}
        </Pressable>

        {showList && (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              marginTop: 8,
              maxHeight: 320,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              overflow: "hidden",
            }}
          >
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
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
    </View>
  );
}
