import { useFocusEffect, useRouter } from "expo-router";
import { Check, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import CongressionalDistrictMap from "../global_components/CongressionalDistrictMap";
import { officialsService } from "../services/officials";

type DistrictSelection = {
  geoid: string;
  stateAbbr: string;
  district: number;
  label: string;
};

type MatchedRep = {
  bioguideId: string;
  name: string;
  party: string;
  district: number;
  state: string;
  photoUrl: string;
};

const STATE_ABBR_TO_STATE: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
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

const STATE_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR_TO_STATE).map(([abbr, state]) => [state, abbr]),
);

const FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  "10": "DE",
  "11": "DC",
  "12": "FL",
  "13": "GA",
  "15": "HI",
  "16": "ID",
  "17": "IL",
  "18": "IN",
  "19": "IA",
  "20": "KS",
  "21": "KY",
  "22": "LA",
  "23": "ME",
  "24": "MD",
  "25": "MA",
  "26": "MI",
  "27": "MN",
  "28": "MS",
  "29": "MO",
  "30": "MT",
  "31": "NE",
  "32": "NV",
  "33": "NH",
  "34": "NJ",
  "35": "NM",
  "36": "NY",
  "37": "NC",
  "38": "ND",
  "39": "OH",
  "40": "OK",
  "41": "OR",
  "42": "PA",
  "44": "RI",
  "45": "SC",
  "46": "SD",
  "47": "TN",
  "48": "TX",
  "49": "UT",
  "50": "VT",
  "51": "VA",
  "53": "WA",
  "54": "WV",
  "55": "WI",
  "56": "WY",
};

const STATES = Object.values(STATE_ABBR_TO_STATE).sort();

const PARTY_COLORS: Record<string, string> = {
  Democrat: "#008CFF",
  Republican: "#D45252",
  Independent: "#F5A623",
};

const PARTY_ABBR: Record<string, string> = {
  Democratic: "D",
  Republican: "R",
  Independent: "I",
  Democrat: "D",
};

export default function DistrictExplorerScreen() {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictSelection | null>(null);
  const [matchedRep, setMatchedRep] = useState<MatchedRep | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStates, setShowStates] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDistrict(null);
      setMatchedRep(null);
    }, []),
  );

  const handleSelectDistrict = async (district: DistrictSelection) => {
    setSelectedDistrict(district);
    setLoading(true);
    setMatchedRep(null);

    try {
      const officialsData = await officialsService.getAll();
      const officials = officialsData.officials as any[];

      const stateAbbr = FIPS_TO_ABBR[district.stateAbbr] || district.stateAbbr;

      const match = officials.find((o) => {
        const termInfo = o.terms?.item?.[o.terms.item.length - 1];
        const isHouse =
          termInfo?.chamber === "House of Representatives" ||
          o.chamber === "House of Representatives";
        const officialStateAbbr = o.state ? STATE_TO_ABBR[o.state] : null;
        const officialDistrict = parseInt(
          termInfo?.district ?? o.district ?? "0",
          10,
        );
        return (
          isHouse &&
          officialStateAbbr === stateAbbr &&
          officialDistrict === district.district
        );
      });

      if (match) {
        setMatchedRep({
          bioguideId: match.bioguideId,
          name: match.name.includes(",")
            ? match.name.split(",").reverse().join(" ").trim()
            : match.name,
          party:
            match.partyName ??
            match.terms?.item?.[match.terms.item.length - 1]?.partyName ??
            "Unknown",
          district: district.district,
          state: stateAbbr,
          photoUrl: `https://bioguide.congress.gov/bioguide/photo/${match.bioguideId[0]}/${match.bioguideId}.jpg`,
        });
      }
    } catch (error) {
      console.error("Failed to match district to representative:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <View
        style={{
          paddingTop: 64,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#1a1a1a",
            marginBottom: 8,
          }}
        >
          Districts
        </Text>
        <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
          Explore congressional districts and find who represents each one.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 200,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* State Selector */}
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1a1a1a",
              marginBottom: 8,
            }}
          >
            Select a state (optional)
          </Text>
          <Pressable
            onPress={() => setShowStates(!showStates)}
            style={({ pressed }) => ({
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              transform: [{ scale: pressed ? 0.98 : 1 }],
              shadowColor: "#000000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 2,
            })}
          >
            <Text
              style={{
                fontSize: 16,
                color: selectedState ? "#1a1a1a" : "#999",
                fontWeight: selectedState ? "600" : "400",
              }}
            >
              {selectedState ?? "View all U.S. districts..."}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {selectedState ? (
                <Check size={20} color="#008CFF" strokeWidth={3} />
              ) : showStates ? (
                <ChevronUp size={20} color="#7B7C81" />
              ) : (
                <ChevronDown size={20} color="#7B7C81" />
              )}
            </View>
          </Pressable>

          {showStates && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                marginTop: 8,
                maxHeight: 320,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
                overflow: "hidden",
              }}
            >
              <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
                {STATES.map((state) => (
                  <Pressable
                    key={state}
                    onPress={() => {
                      setSelectedState(state);
                      setShowStates(false);
                      setSelectedDistrict(null);
                      setMatchedRep(null);
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f5f5f5",
                      backgroundColor: pressed
                        ? "#f0f8ff"
                        : selectedState === state
                          ? "#E8F4FF"
                          : "#fff",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#1a1a1a",
                        fontWeight: selectedState === state ? "600" : "400",
                      }}
                    >
                      {state}
                    </Text>
                    {selectedState === state && (
                      <Check size={18} color="#008CFF" strokeWidth={3} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* District Map */}
        <CongressionalDistrictMap
          stateAbbr={selectedState ? STATE_TO_ABBR[selectedState] : null}
          onSelectDistrict={handleSelectDistrict}
        />

        {/* Selected District Info */}
        {selectedDistrict && (
          <View
            style={{
              backgroundColor: "#EEF7FF",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "#B7D7F5",
            }}
          >
            <Text style={{ fontSize: 13, color: "#005EA8", fontWeight: "600" }}>
              {selectedDistrict.label}
            </Text>
          </View>
        )}

        {/* Matched Representative */}
        {loading && (
          <View style={{ alignItems: "center", paddingVertical: 24 }}>
            <ActivityIndicator color="#008CFF" />
          </View>
        )}

        {matchedRep && !loading && (
          <Pressable
            onPress={() => {
              router.push(
                `/official/${matchedRep.bioguideId}` as `${string}/${string}`,
              );
            }}
            style={({ pressed }) => ({
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#008CFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 4,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                overflow: "hidden",
                backgroundColor: "#eee",
                marginRight: 14,
              }}
            >
              <Text
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: PARTY_COLORS[matchedRep.party] ?? "#999",
                  textAlignVertical: "center",
                  textAlign: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: "700",
                }}
              >
                {matchedRep.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 13, color: "#7B7C81" }}>
                  {PARTY_ABBR[matchedRep.party] ?? matchedRep.party}
                </Text>
                <Text style={{ fontSize: 11, color: "#999" }}>
                  District {matchedRep.district}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1a1a1a",
                }}
              >
                {matchedRep.name}
              </Text>
            </View>
            <Text style={{ fontSize: 28, color: "#008CFF" }}>→</Text>
          </Pressable>
        )}

        {selectedDistrict && !matchedRep && !loading && (
          <View
            style={{
              backgroundColor: "#FFF8E7",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "#F5A623",
            }}
          >
            <Text style={{ fontSize: 13, color: "#8B6914", lineHeight: 18 }}>
              Couldn't find a representative for this district in our database.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
