import { Redirect } from "expo-router";
import { getDb } from "./utils/database";

function isOnboardingComplete(): boolean {
  try {
    const db = getDb();
    const row = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'onboarding_complete'`,
    );
    return row?.value === "true";
  } catch {
    return false;
  }
}

export default function Index() {
  const onboardingDone = isOnboardingComplete();
  return (
    <Redirect
      href={(onboardingDone ? "/(tabs)/home" : "/onboarding/welcome") as any}
    />
  );
}
