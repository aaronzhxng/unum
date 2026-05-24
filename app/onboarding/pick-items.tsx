import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useOnboarding } from "../context/OnboardingContext";
import { officialsService } from "../services/officials";
import { getBillIcon } from "../utils/billIcons";

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

const PARTY_ABBR: Record<string, string> = {
  Democratic: "D",
  Republican: "R",
  Independent: "I",
  Democrat: "D",
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
    bioguideId: "J000299",
    name: "Mike Johnson",
    party: "R",
    role: "Representative",
    state: "LA",
    district: "4",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/J/J000299.jpg",
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
    policyArea: "Government Operations and Politics",
  },
  {
    id: "hr2709",
    type: "HR",
    number: "2709",
    title: "Save Our Sequoias Act",
    description:
      "Authorizes emergency measures to protect giant sequoia trees.",
    policyArea: "Environmental Protection",
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
    policyArea: "Agriculture and Food",
  },
];

const POLICY_AREA_COLORS: Record<string, string> = {
  "Government Operations and Politics": "#6B7FD4",
  "Economics and Public Finance": "#4CAF82",
  "Finance and Financial Sector": "#4CAF82",
  Education: "#F5A623",
  "Environmental Protection": "#27AE60",
  Energy: "#E67E22",
  "Agriculture and Food": "#8B6914",
};

const STATE_TO_ABBR_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR).map(([abbr, state]) => [state, abbr]),
);

const formatName = (name: string): string => {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",").map((s) => s.trim());
  return `${first} ${last}`;
};

function formatRole(
  official: (typeof SUGGESTED_OFFICIALS)[0],
  screenWidth: number,
) {
  const fullState = STATE_ABBR[official.state] ?? official.state;
  const district = official.district ? `, District ${official.district}` : "";
  if (official.role === "Senator") {
    const full = `Senator, ${fullState}`;
    const abbr = `Sen, ${fullState}`;
    if (screenWidth < 390) return abbr;
    return full.length > 40 ? abbr : full;
  }
  const full = `Representative, ${fullState}${district}`;
  const abbr = `Rep, ${fullState}${district}`;
  if (screenWidth < 390) return abbr;
  return full.length > 39 ? abbr : full;
}

type Tab = "officials" | "bills";

export default function PickItemsScreen() {
  const router = useRouter();
  const {
    selectedOfficials,
    setSelectedOfficials,
    selectedBills,
    setSelectedBills,
    userRepBioguideId,
    foundRepBioguideId,
    priorityState,
    setOverlayConfig,
    familiarityLevel,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useOnboarding();

  const [activeTab, setActiveTab] = useState<Tab>("officials");
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [personalOfficials, setPersonalOfficials] = useState<
    typeof SUGGESTED_OFFICIALS
  >([]);
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const { width: screenWidth } = useWindowDimensions();
  const totalSelected = selectedOfficials.length + selectedBills.length;

  useEffect(() => {
    const loadPersonalOfficials = async () => {
      try {
        const data = await officialsService.getAll();
        const all = data.officials as any[];
        const personal: typeof SUGGESTED_OFFICIALS = [];

        // Add rep if found (use foundRepBioguideId — set whether or not user checked it)
        const repId = foundRepBioguideId ?? userRepBioguideId;
        if (repId) {
          const rep = all.find((o) => o.bioguideId === repId);
          if (rep) {
            personal.push({
              bioguideId: rep.bioguideId,
              name: rep.name,
              party: PARTY_ABBR[rep.partyName] ?? rep.partyName ?? "Unknown",
              role: "Representative",
              state: rep.state
                ? (STATE_TO_ABBR_REVERSE[rep.state] ?? rep.state)
                : "",
              district: rep.district?.toString() ?? "",
              photoUrl: `https://bioguide.congress.gov/bioguide/photo/${rep.bioguideId[0]}/${rep.bioguideId}.jpg`,
            });
          }
        }

        // Add senators from priority state
        if (priorityState) {
          const senators = all.filter(
            (o) =>
              o.state === priorityState &&
              (o.chamber === "Senate" ||
                o.terms?.item?.[o.terms.item.length - 1]?.chamber === "Senate"),
          );
          for (const sen of senators) {
            if (!personal.find((p) => p.bioguideId === sen.bioguideId)) {
              personal.push({
                bioguideId: sen.bioguideId,
                name: sen.name,
                party: PARTY_ABBR[sen.partyName] ?? sen.partyName ?? "Unknown",
                role: "Senator",
                state: STATE_TO_ABBR_REVERSE[sen.state] ?? sen.state,
                photoUrl: `https://bioguide.congress.gov/bioguide/photo/${sen.bioguideId[0]}/${sen.bioguideId}.jpg`,
              });
            }
          }
        }

        setPersonalOfficials(personal);

        // Only auto-select senators — rep selection carries over from pick-rep
        // (if they checked the rep there, it's already in selectedOfficials)
        const senatorIds = personal
          .filter((o) => o.role === "Senator")
          .map((o) => o.bioguideId)
          .filter((id) => !selectedOfficials.includes(id));
        if (senatorIds.length > 0) {
          setSelectedOfficials([...selectedOfficials, ...senatorIds]);
        }
      } catch (e) {
        console.error("Failed to load personal officials:", e);
      } finally {
        setLoadingPersonal(false);
      }
    };

    loadPersonalOfficials();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 5,
        continueLabel:
          totalSelected > 0
            ? `Finish (${totalSelected} Item${totalSelected > 1 ? "s" : ""})`
            : "Finish",
        onContinue: () => router.push("/onboarding/finish" as any),
        onBack: () => router.back(),
        onSkip: () => {
          setSelectedOfficials([]);
          setSelectedBills([]);
          router.push("/onboarding/finish" as any);
        },
      });
    }, [totalSelected]),
  );

  const toggleOfficial = (id: string) => {
    setSelectedOfficials(
      selectedOfficials.includes(id)
        ? selectedOfficials.filter((o) => o !== id)
        : [...selectedOfficials, id],
    );
  };

  const toggleBill = (id: string) => {
    setSelectedBills(
      selectedBills.includes(id)
        ? selectedBills.filter((b) => b !== id)
        : [...selectedBills, id],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Header */}
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
          {familiarityLevel === "low"
            ? "Build your first list"
            : familiarityLevel === "high"
              ? "Build your first list"
              : "Build your first list"}
        </Text>
        <Text style={{ fontSize: 15, color: "#535353" }}>
          {familiarityLevel === "low"
            ? "This list will store all the officials and bills you want to track. You can add some names you recognize — officials or bills you've heard about. You can always add more later."
            : familiarityLevel === "high"
              ? "Add officials and legislation to a watchlist to keep track of. You can add more later."
              : "This list will store all the officials and bills you want to track. You can always add more later."}
        </Text>
      </View>

      {/* Tab switcher */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginBottom: 12,
          backgroundColor: "#EFEFEF",
          borderRadius: 12,
          padding: 4,
        }}
      >
        {(["officials", "bills"] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: activeTab === tab ? "#fff" : "transparent",
              shadowColor: activeTab === tab ? "#000" : "transparent",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: activeTab === tab ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === tab ? "600" : "400",
                color: activeTab === tab ? "#1a1a1a" : "#535353",
              }}
            >
              {tab === "officials"
                ? `Officials${selectedOfficials.length > 0 ? ` (${selectedOfficials.length})` : ""}`
                : `Bills${selectedBills.length > 0 ? ` (${selectedBills.length})` : ""}`}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          marginBottom: 4,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text
          style={{
            fontSize: 15,
            color: "#1a1a1a",
            fontWeight: "500",
            flex: 1,
            marginRight: 12,
          }}
        >
          Notify me about activity from followed officials and bills
        </Text>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: notificationsEnabled ? "#008CFF" : "#ccc",
            backgroundColor: notificationsEnabled ? "#008CFF" : "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {notificationsEnabled && (
            <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>
              ✓
            </Text>
          )}
        </View>
      </Pressable>

      {activeTab === "officials" && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Personalized officials — rep + senators */}
          {personalOfficials.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#535353",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Your Officials
              </Text>
              {personalOfficials.map((official) => {
                const isSelected = selectedOfficials.includes(
                  official.bioguideId,
                );
                const hasError = imageErrors.has(official.bioguideId);
                const isUserRep = userRepBioguideId === official.bioguideId;
                return (
                  <Pressable
                    key={official.bioguideId}
                    onPress={() => toggleOfficial(official.bioguideId)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isSelected ? "#E8F4FF" : "#fff",
                      borderRadius: 24,
                      paddingVertical: 16,
                      paddingHorizontal: 14,
                      margin: 2,
                      marginBottom: 12,
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
                      }}
                    >
                      {!hasError ? (
                        <Image
                          source={{ uri: official.photoUrl }}
                          style={{ width: "100%", height: "120%" }}
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
                            {formatName(official.name).charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      {isUserRep && (
                        <View
                          style={{
                            alignSelf: "flex-start",
                            backgroundColor: "#E8F4FF",
                            borderRadius: 6,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            marginBottom: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#008CFF",
                              fontWeight: "600",
                            }}
                          >
                            Your Representative
                          </Text>
                        </View>
                      )}
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#535353",
                        }}
                      >
                        {formatName(official.name)}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: "#7B7C81" }}>
                          {official.party}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#000000",
                            marginHorizontal: 4,
                            fontWeight: "900",
                          }}
                        >
                          ·
                        </Text>
                        <Text
                          style={{ fontSize: 13, color: "#7B7C81" }}
                          numberOfLines={1}
                        >
                          {formatRole(official, screenWidth)}{" "}
                        </Text>
                      </View>
                    </View>
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
                  </Pressable>
                );
              })}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#535353",
                  marginBottom: 10,
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Popular Officials
              </Text>
            </>
          )}

          {/* Suggested officials — filter out any already in personal */}
          {SUGGESTED_OFFICIALS.filter(
            (o) =>
              !personalOfficials.find((p) => p.bioguideId === o.bioguideId),
          ).map((official) => {
            const isSelected = selectedOfficials.includes(official.bioguideId);
            const hasError = imageErrors.has(official.bioguideId);
            const isUserRep = userRepBioguideId === official.bioguideId;

            return (
              <Pressable
                key={official.bioguideId}
                onPress={() => toggleOfficial(official.bioguideId)}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isSelected ? "#E8F4FF" : "#fff",
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 14,
                  margin: 2,
                  marginBottom: 12,
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
                  }}
                >
                  {!hasError ? (
                    <Image
                      source={{ uri: official.photoUrl }}
                      style={{ width: "100%", height: "120%" }}
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
                        {formatName(official.name).charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  {isUserRep && (
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: "#E8F4FF",
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#008CFF",
                          fontWeight: "600",
                        }}
                      >
                        Your Representative
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#535353",
                    }}
                  >
                    {formatName(official.name)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 2,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#7B7C81" }}>
                      {official.party}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#000000",
                        marginHorizontal: 4,
                        fontWeight: "900",
                      }}
                    >
                      ·
                    </Text>
                    <Text
                      style={{ fontSize: 13, color: "#7B7C81" }}
                      numberOfLines={1}
                    >
                      {formatRole(official, screenWidth)}{" "}
                    </Text>
                  </View>
                </View>

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
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Bills tab */}
      {activeTab === "bills" && (
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
                onPress={() => toggleBill(bill.id)}
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
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
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
                          color: "#535353",
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
      )}
    </View>
  );
}
