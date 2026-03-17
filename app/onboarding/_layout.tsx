import { Stack } from "expo-router";
import { OnboardingProvider } from "../context/OnboardingContext";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="pick-officials" />
        <Stack.Screen name="pick-bills" />
        <Stack.Screen name="pick-policy-areas" />
        <Stack.Screen name="pick-state" />
        <Stack.Screen name="name-list" />
        <Stack.Screen name="finish" />
        <Stack.Screen name="tour" />
      </Stack>
    </OnboardingProvider>
  );
}
