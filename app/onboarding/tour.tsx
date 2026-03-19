import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TourScreen() {
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const proceed = async () => {
        await AsyncStorage.setItem("pending_tour", "true");
        router.replace("/(tabs)/home" as any);
      };
      proceed();
    }, []),
  );

  return <View style={{ flex: 1, backgroundColor: "#fafafa" }} />;
}
