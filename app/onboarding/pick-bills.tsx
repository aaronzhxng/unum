import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

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
      "Establishes a regulatory framework for digital assets and cryptocurrency markets.",
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
  const { selectedBills, setSelectedBills } = useOnboarding();

  const toggle = (id: string) => {
    setSelectedBills(
      selectedBills.includes(id)
        ? selectedBills.filter((b) => b !== id)
        : [...selectedBills, id],
    );
  };

  const handleContinue = () =>
    router.push("/onboarding/pick-policy-areas" as any);
  const handleSkip = () => router.push("/onboarding/pick-policy-areas" as any);

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Header */}
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 16 }}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <ChevronLeft size={28} color="#535353" />
        </Pressable>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 8,
          }}
        >
          Follow some bills
        </Text>
        <Text style={{ fontSize: 15, color: "#535353" }}>
          Select bills you'd like to track. You can always add more later.
        </Text>
      </View>

      {/* Bill Cards */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 180 }}
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
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {/* Bill type badge */}
                <View
                  style={{
                    backgroundColor: dotColor,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginRight: 10,
                    marginTop: 2,
                    minWidth: 40,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                  >
                    {bill.type}.{bill.number}
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: 4,
                    }}
                  >
                    {bill.title}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#535353", lineHeight: 18 }}
                  >
                    {bill.description}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: dotColor,
                      marginTop: 6,
                      fontWeight: "500",
                    }}
                  >
                    {bill.policyArea}
                  </Text>
                </View>

                {/* Checkmark */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? "#008CFF" : "#ccc",
                    backgroundColor: isSelected ? "#008CFF" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 8,
                    marginTop: 2,
                  }}
                >
                  {isSelected && (
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
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

      {/* Bottom Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fafafa",
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        }}
      >
        {/* Dot indicators */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: i === 2 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 2 ? "#008CFF" : "#D0D0D0",
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => ({
            backgroundColor: "#008CFF",
            paddingVertical: 16,
            borderRadius: 32,
            alignItems: "center",
            marginBottom: 12,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {selectedBills.length > 0
              ? `Add ${selectedBills.length} Bill${selectedBills.length > 1 ? "s" : ""}`
              : "Continue"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          style={{ alignItems: "center", paddingVertical: 8 }}
        >
          <Text style={{ color: "#535353", fontSize: 15 }}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
