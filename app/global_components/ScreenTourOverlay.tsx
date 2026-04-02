import Constants from "expo-constants";
import React from "react";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";

export type ScreenTourStep = {
  title: string;
  description: string;
  horizontalInset?: number;
  targetLayout: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

interface Props {
  steps: ScreenTourStep[];
  currentStep: number;
  onNext: () => void;
  onEnd: () => void;
}

export default function ScreenTourOverlay({
  steps,
  currentStep,
  onNext,
  onEnd,
}: Props) {
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const targetLayout = step.targetLayout;

  if (!targetLayout) return null;

  const statusBarHeight =
    Platform.OS === "android" ? (Constants.statusBarHeight ?? 0) : 0;
  const adjustedY = targetLayout.y + statusBarHeight;
  const TOOLTIP_HEIGHT = 160;
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const showAbove =
    adjustedY + targetLayout.height + TOOLTIP_HEIGHT > SCREEN_HEIGHT - 100;

  const tooltipTop = showAbove
    ? Math.max(adjustedY - TOOLTIP_HEIGHT - 12, 60)
    : Math.min(
        adjustedY + targetLayout.height + 12,
        SCREEN_HEIGHT - TOOLTIP_HEIGHT - 80,
      );

  const inset = step.horizontalInset ?? 0;

  return (
    <>
      {/* Dim overlay */}
      <View
        pointerEvents="box-only"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 998,
        }}
      />

      {/* Blue highlight box */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: adjustedY - 6,
          left: targetLayout.x + inset - 6,
          width: targetLayout.width - inset * 2 + 12,
          height: targetLayout.height + 12,
          borderRadius: 16,
          borderWidth: 2.5,
          borderColor: "#008CFF",
          backgroundColor: "rgba(0,140,255,0.08)",
          zIndex: 999,
        }}
      />

      {/* Tooltip card */}
      <View
        style={{
          position: "absolute",
          top: tooltipTop,
          left: 16,
          right: 16,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
          zIndex: 1000,
        }}
      >
        {/* Step dots */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === currentStep ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === currentStep ? "#008CFF" : "#e0e0e0",
              }}
            />
          ))}
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 6,
          }}
        >
          {step.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          {step.description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={onEnd}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ fontSize: 14, color: "#7B7C81" }}>Skip tour</Text>
          </Pressable>
          <Pressable
            onPress={isLast ? onEnd : onNext}
            style={({ pressed }) => ({
              backgroundColor: "#008CFF",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              {isLast ? "Done" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
