import NetInfo from "@react-native-community/netinfo";
import { ChevronLeft, WifiOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";

interface ErrorScreenProps {
  onRetry?: () => void;
  onBack?: () => void;
  message?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ErrorScreen({
  onRetry,
  onBack,
  message,
}: ErrorScreenProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const isOffline = isConnected === false;

  return (
    <View style={{ flex: 1 }}>
      {onBack && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop:
              SCREEN_HEIGHT < 700
                ? Platform.OS === "ios"
                  ? 44
                  : 32
                : SCREEN_HEIGHT < 800
                  ? Platform.OS === "ios"
                    ? 52
                    : 40
                  : Platform.OS === "ios"
                    ? 60
                    : 45,
            paddingBottom: 8,
          }}
        >
          <Pressable
            onPress={onBack}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
              alignSelf: "flex-start",
            })}
          >
            <ChevronLeft size={24} color="#535353" />
          </Pressable>
        </View>
      )}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        {isOffline && (
          <WifiOff size={32} color="#BFBFBF" style={{ marginBottom: 12 }} />
        )}
        <Text
          style={{
            color: "#535353",
            fontSize: 15,
            fontWeight: "600",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {isOffline
            ? "No Internet Connection"
            : (message ?? "Something went wrong")}
        </Text>
        <Text
          style={{
            color: "#7B7C81",
            fontSize: 13,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          {isOffline
            ? "Please check your connection and try again."
            : "This may be a temporary issue. Please try again."}
        </Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => ({
              backgroundColor: "#00AFFF",
              borderRadius: 12,
              paddingHorizontal: 32,
              paddingVertical: 12,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}>
              Try Again
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
