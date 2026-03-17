import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View
      style={{ flex: 1, backgroundColor: "#fafafa", paddingHorizontal: 32 }}
    >
      {/* Center content */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("../../assets/app_icons/app_icon.png")}
          style={{ width: 96, height: 96, borderRadius: 22, marginBottom: 24 }}
          resizeMode="cover"
        />
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 16,
            textAlign: "center",
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

      {/* Bottom: dots + button */}
      <View style={{ paddingBottom: 48 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: i === 0 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 0 ? "#008CFF" : "#D0D0D0",
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={() => router.push("/onboarding/pick-officials" as any)}
          style={({ pressed }) => ({
            backgroundColor: "#008CFF",
            paddingVertical: 16,
            borderRadius: 32,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            alignItems: "center",
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
