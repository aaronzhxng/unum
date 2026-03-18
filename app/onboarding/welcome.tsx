import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { setOverlayConfig } = useOnboarding();

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 0,
        continueLabel: "Get Started",
        onContinue: () => router.push("/onboarding/pick-officials" as any),
        showBorder: false,
      });
    }, []),
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fafafa",
        paddingHorizontal: 32,
        paddingBottom: 160,
      }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../../assets/app_icons/app_icon_small.png")}
          style={{ width: 96, height: 96, borderRadius: 22, marginBottom: 24 }}
          resizeMode="cover"
        />
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: "#1a1a1a",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Welcome to Unum
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#535353",
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          Unum lets you build lists of your elected officials, bills, and policy
          areas of interest.
        </Text>
      </View>
    </View>
  );
}
