import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

const STATE_ABBR: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const SUGGESTED_OFFICIALS = [
  {
    bioguideId: "O000172",
    name: "Alexandria Ocasio-Cortez",
    party: "D",
    role: "Representative",
    state: "NY",
    district: "14",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/O/O000172.jpg",
  },
  {
    bioguideId: "S000033",
    name: "Bernie Sanders",
    party: "I",
    role: "Senator",
    state: "VT",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/S/S000033.jpg",
  },
  {
    bioguideId: "M000355",
    name: "Mitch McConnell",
    party: "R",
    role: "Senator",
    state: "KY",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/M/M000355.jpg",
  },
  {
    bioguideId: "J000304",
    name: "Mike Johnson",
    party: "R",
    role: "Representative",
    state: "LA",
    district: "4",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/J/J000304.jpg",
  },
  {
    bioguideId: "J000294",
    name: "Hakeem Jeffries",
    party: "D",
    role: "Representative",
    state: "NY",
    district: "8",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/J/J000294.jpg",
  },
  {
    bioguideId: "C001098",
    name: "Ted Cruz",
    party: "R",
    role: "Senator",
    state: "TX",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/C/C001098.jpg",
  },
  {
    bioguideId: "P000603",
    name: "Rand Paul",
    party: "R",
    role: "Senator",
    state: "KY",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/P/P000603.jpg",
  },
];

const PARTY_COLORS: Record<string, string> = {
  D: "#008CFF",
  R: "#D45252",
  I: "#F5A623",
};

function formatRole(official: (typeof SUGGESTED_OFFICIALS)[0]) {
  const fullState = STATE_ABBR[official.state] ?? official.state;
  if (official.role === "Senator") return `Senator · ${fullState}`;
  return `Representative · ${fullState}${official.district ? `, District ${official.district}` : ""}`;
}

export default function PickOfficialsScreen() {
  const router = useRouter();
  const { selectedOfficials, setSelectedOfficials } = useOnboarding();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedOfficials(
      selectedOfficials.includes(id)
        ? selectedOfficials.filter((o) => o !== id)
        : [...selectedOfficials, id],
    );
  };

  const handleContinue = () => router.push("/onboarding/pick-bills" as any);
  const handleSkip = () => router.push("/onboarding/pick-bills" as any);

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
          Add some officials
        </Text>
        <Text style={{ fontSize: 15, color: "#535353" }}>
          Select officials you'd like to follow. You can always add more later.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        {SUGGESTED_OFFICIALS.map((official) => {
          const isSelected = selectedOfficials.includes(official.bioguideId);
          const hasError = imageErrors.has(official.bioguideId);
          return (
            <Pressable
              key={official.bioguideId}
              onPress={() => toggle(official.bioguideId)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isSelected ? "#E8F4FF" : "#fff",
                borderRadius: 16,
                padding: 12,
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
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  overflow: "hidden",
                  backgroundColor: "#eee",
                  marginRight: 12,
                  borderWidth: 4,
                  borderColor: PARTY_COLORS[official.party] ?? "#008CFF",
                }}
              >
                {!hasError ? (
                  <Image
                    source={{ uri: official.photoUrl }}
                    style={{ width: "100%", height: "110%" }}
                    resizeMode="cover"
                    onError={() =>
                      setImageErrors(
                        (prev) => new Set([...prev, official.bioguideId]),
                      )
                    }
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#BFBFBF",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      {official.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a" }}
                >
                  {official.name}
                </Text>
                <Text style={{ fontSize: 13, color: "#535353", marginTop: 2 }}>
                  {official.party} · {formatRole(official)}
                </Text>
              </View>

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
                }}
              >
                {isSelected && (
                  <Text
                    style={{ color: "white", fontSize: 14, fontWeight: "700" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom */}
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
                width: i === 1 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 1 ? "#008CFF" : "#D0D0D0",
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
            {selectedOfficials.length > 0
              ? `Add ${selectedOfficials.length} Official${selectedOfficials.length > 1 ? "s" : ""}`
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
