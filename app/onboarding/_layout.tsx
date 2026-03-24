import { Stack } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import {
  OnboardingProvider,
  useOnboarding,
} from "../context/OnboardingContext";

function OnboardingOverlay() {
  const { overlayConfig } = useOnboarding();
  if (!overlayConfig) return null;

  const {
    dotIndex,
    continueLabel,
    onContinue,
    onBack,
    onSkip,
    continueDisabled,
  } = overlayConfig;

  return (
    <>
      {/* Skip — top right */}
      {onSkip && (
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => ({
            position: "absolute",
            top: 64,
            right: 24,
            zIndex: 100,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ fontSize: 15, color: "#535353" }}>Skip</Text>
        </Pressable>
      )}

      {/* Fixed bottom bar */}
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
          borderTopWidth: overlayConfig.showBorder === false ? 0 : 1,
          borderTopColor: "#f0f0f0",
          zIndex: 100,
        }}
      >
        {/* Progress dots — 8 total for new flow:
            0: welcome
            1: how-familiar
            2: pick-policy-areas
            3: pick-state
            4: pick-rep
            5: pick-items
            6: finish
            7: tour (no overlay shown)
        */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={{
                width: i === dotIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === dotIndex ? "#008CFF" : "#D0D0D0",
              }}
            />
          ))}
        </View>

        {/* Back + Continue row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 16,
                borderRadius: 32,
                alignItems: "center",
                backgroundColor: "#EFEFEF",
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#535353" }}
              >
                Back
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onContinue}
            disabled={continueDisabled}
            style={({ pressed }) => ({
              flex: onBack ? 2 : 1,
              paddingVertical: 16,
              borderRadius: 32,
              alignItems: "center",
              backgroundColor: continueDisabled ? "#ccc" : "#008CFF",
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {continueLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
          <Stack.Screen name="welcome" />
          <Stack.Screen name="how-familiar" />
          <Stack.Screen name="pick-policy-areas" />
          <Stack.Screen name="pick-state" />
          <Stack.Screen name="pick-rep" />
          <Stack.Screen name="pick-items" />
          <Stack.Screen name="finish" />
          <Stack.Screen name="tour" />
        </Stack>
        <OnboardingOverlay />
      </View>
    </OnboardingProvider>
  );
}
