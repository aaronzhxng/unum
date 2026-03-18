import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";
import { getBillIcon } from "../utils/billIcons";

const SUGGESTED_BILLS = [
  {
    id: "hr22",
    type: "HR",
    number: "22",
    title: "SAVE Act",
    description:
      "Requires proof of citizenship to register to vote in federal elections.",
    policyArea: "Government Operations and Politics",
  },
  {
    id: "hr7148",
    type: "HR",
    number: "7148",
    title: "Consolidated Appropriations Act, 2026",
    description:
      "Full-year government funding legislation for fiscal year 2026.",
    policyArea: "Economics and Public Finance",
  },
  {
    id: "hr3633",
    type: "HR",
    number: "3633",
    title: "Digital Asset Market Clarity Act of 2025",
    description:
      "Establishes a regulatory framework for digital assets and crypto markets.",
    policyArea: "Finance and Financial Sector",
  },
  {
    id: "hr7894",
    type: "HR",
    number: "7894",
    title: "Truman Scholarship Clean House Act",
    description: "Reforms the Truman Scholarship Foundation.",
    policyArea: "Education",
  },
  {
    id: "s2563",
    type: "S",
    number: "2563",
    title: "Global Investment in American Jobs Act of 2025",
    description: "Promotes foreign investment in American job creation.",
    policyArea: "Foreign Trade and International Finance",
  },
  {
    id: "hr2709",
    type: "HR",
    number: "2709",
    title: "Save Our Sequoias Act",
    description:
      "Authorizes emergency measures to protect giant sequoia trees.",
    policyArea: "Public Lands and Natural Resources",
  },
  {
    id: "hr398",
    type: "HR",
    number: "398",
    title: "Geothermal Cost-Recovery Authority Act",
    description: "Expands geothermal energy development on federal lands.",
    policyArea: "Energy",
  },
  {
    id: "s3718",
    type: "S",
    number: "3718",
    title: "Delivering for Rural Seniors Act of 2026",
    description:
      "Improves delivery of services and benefits to rural senior citizens.",
    policyArea: "Social Welfare",
  },
];

const POLICY_AREA_COLORS: Record<string, string> = {
  "Government Operations and Politics": "#6B7FD4",
  "Economics and Public Finance": "#4CAF82",
  "Finance and Financial Sector": "#4CAF82",
  Education: "#F5A623",
  "Foreign Trade and International Finance": "#9B59B6",
  "Public Lands and Natural Resources": "#27AE60",
  Energy: "#E67E22",
  "Social Welfare": "#E91E8C",
};

export default function PickBillsScreen() {
  const router = useRouter();
  const { selectedBills, setSelectedBills, setOverlayConfig } = useOnboarding();

  const toggle = (id: string) => {
    setSelectedBills(
      selectedBills.includes(id)
        ? selectedBills.filter((b) => b !== id)
        : [...selectedBills, id],
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 2,
        continueLabel:
          selectedBills.length > 0
            ? `Add ${selectedBills.length} Bill${selectedBills.length > 1 ? "s" : ""}`
            : "Continue",
        onContinue: () => router.push("/onboarding/pick-policy-areas" as any),
        onBack: () => router.back(),
        onSkip: () => router.push("/onboarding/pick-policy-areas" as any),
      });
    }, [selectedBills]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 16 }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 8,
            marginTop: 32,
          }}
        >
          Follow some bills
        </Text>
        <Text style={{ fontSize: 15, color: "#535353" }}>
          Select bills you'd like to track. You can always add more later.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        {SUGGESTED_BILLS.map((bill) => {
          const isSelected = selectedBills.includes(bill.id);
          const dotColor = POLICY_AREA_COLORS[bill.policyArea] ?? "#008CFF";
          return (
            <Pressable
              key={bill.id}
              onPress={() => toggle(bill.id)}
              style={({ pressed }) => ({
                backgroundColor: isSelected ? "#E8F4FF" : "#fff",
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                borderWidth: 2,
                borderColor: isSelected ? "#008CFF" : "transparent",
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              })}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Left column: badge + icon */}
                <View
                  style={{
                    alignItems: "center",
                    flexShrink: 0,
                    width: 64,
                    marginRight: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: dotColor,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      marginBottom: 6,
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                      numberOfLines={1}
                    >
                      {bill.type}.{bill.number}
                    </Text>
                  </View>
                  <Image
                    source={getBillIcon(bill.policyArea)}
                    style={{ width: 50, height: 50, borderRadius: 6 }}
                    resizeMode="contain"
                  />
                </View>

                {/* Info */}
                <View
                  style={{
                    flex: 1,
                    alignSelf: "stretch",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: dotColor,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {bill.policyArea}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#1a1a1a",
                      }}
                      numberOfLines={2}
                    >
                      {bill.title}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 12, color: "#7B7C81" }}
                    numberOfLines={1}
                  >
                    {bill.description}
                  </Text>
                </View>

                {/* Square checkbox */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: isSelected ? "#008CFF" : "#ccc",
                    backgroundColor: isSelected ? "#008CFF" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 8,
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
