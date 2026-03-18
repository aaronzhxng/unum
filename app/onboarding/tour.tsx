import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTour } from "../context/TourContext";

export default function TourScreen() {
  const router = useRouter();
  const { startTour } = useTour();

  useFocusEffect(
    React.useCallback(() => {
      // Small delay so tabs are mounted before tour starts
      const timer = setTimeout(() => {
        startTour();
      }, 300);
      return () => clearTimeout(timer);
    }, []),
  );

  return <View style={{ flex: 1, backgroundColor: "#fafafa" }} />;
}
