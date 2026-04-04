import NetInfo from "@react-native-community/netinfo";
import { WifiOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface ErrorScreenProps {
  onRetry?: () => void;
  message?: string;
}

export default function ErrorScreen({ onRetry, message }: ErrorScreenProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const isOffline = isConnected === false;

  return (
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
            backgroundColor: pressed ? "#e0f0ff" : "#f0f8ff",
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: "#008CFF",
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ color: "#008CFF", fontSize: 14, fontWeight: "600" }}>
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
}
