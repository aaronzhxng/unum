import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useOnboarding } from "../context/OnboardingContext";
import CongressionalDistrictMap from "../global_components/CongressionalDistrictMap";
import { officialsService } from "../services/officials";

// State name → abbreviation lookup
const STATE_TO_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const TERRITORY_TO_ABBR: Record<string, string> = {
  "American Samoa": "AS",
  "District of Columbia": "DC",
  Guam: "GU",
  "Northern Mariana Islands": "MP",
  "Puerto Rico": "PR",
  "U.S. Virgin Islands": "VI",
  "Virgin Islands": "VI",
};

const SINGLE_REP_STATES = new Set([
  "Alaska",
  "Delaware",
  "North Dakota",
  "South Dakota",
  "Vermont",
  "Wyoming",
]);

const TERRITORIES = new Set([
  "American Samoa",
  "District of Columbia",
  "Guam",
  "Northern Mariana Islands",
  "Puerto Rico",
  "U.S. Virgin Islands",
]);

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

const ABBR_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_TO_ABBR).map(([state, abbr]) => [abbr, state]),
);

interface RepResult {
  bioguideId: string;
  name: string;
  party: string;
  role: string;
  photoUrl: string;
}

interface DistrictSelection {
  geoid: string;
  stateAbbr: string;
  district: number;
  label: string;
}

export default function PickRepScreen() {
  const router = useRouter();
  const {
    priorityState,
    setUserRepBioguideId,
    setFoundRepBioguideId,
    setSelectedOfficials,
    selectedOfficials,
    setOverlayConfig,
    familiarityLevel,
  } = useOnboarding();

  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rep, setRep] = useState<RepResult | null>(null);
  const [repSelected, setRepSelected] = useState(false);
  const [stateMismatch, setStateMismatch] = useState(false);
  const [multipleReps, setMultipleReps] = useState<RepResult[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [showAllReps, setShowAllReps] = useState(false);
  const [districtSelection, setDistrictSelection] =
    useState<DistrictSelection | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const stateAbbrForLookup = priorityState
    ? STATE_TO_ABBR[priorityState]
    : null;

  const formatName = (name: string): string => {
    if (!name.includes(",")) return name;
    const [last, first] = name.split(",").map((s) => s.trim());
    return `${first} ${last}`;
  };

  const matchDistrictToRep = async ({
    geoid,
    stateAbbr,
    district,
    label,
  }: DistrictSelection) => {
    setLoading(true);
    setError(null);
    setRep(null);
    setRepSelected(false);
    setSelectedRepId(null);
    setMultipleReps([]);
    setShowAllReps(false);
    setDistrictSelection({
      geoid,
      stateAbbr,
      district,
      label,
    });

    try {
      const officialsData = await officialsService.getAll();
      const officials = officialsData.officials as any[];

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
          officialDistrict === district
        );
      });

      if (!match) {
        setError("Found the district, but couldn't match it to our database.");
        return;
      }

      const districtSuffix = match.district
        ? `, District ${match.district}`
        : "";
      const stateName = ABBR_TO_STATE[stateAbbr] ?? stateAbbr;
      const repResult: RepResult = {
        bioguideId: match.bioguideId,
        name: formatName(match.name),
        party:
          match.partyName ??
          match.terms?.item?.[match.terms.item.length - 1]?.partyName ??
          "Unknown",
        role: (() => {
          const full = `Representative, ${stateName}${districtSuffix}`;
          const abbr = `Rep, ${stateName}${districtSuffix}`;
          if (screenWidth < 390) return abbr;
          return full.length > 39 ? abbr : full;
        })(),
        photoUrl: `https://bioguide.congress.gov/bioguide/photo/${match.bioguideId[0]}/${match.bioguideId}.jpg`,
      };

      setResolvedState(stateAbbr);
      setStateMismatch(
        Boolean(stateAbbrForLookup && stateAbbr !== stateAbbrForLookup),
      );
      setRep(repResult);
      setFoundRepBioguideId(repResult.bioguideId);
      setRepSelected(true);
      setSelectedRepId(repResult.bioguideId);
      setUserRepBioguideId(repResult.bioguideId);
      if (!selectedOfficials.includes(repResult.bioguideId)) {
        setSelectedOfficials([...selectedOfficials, repResult.bioguideId]);
      }
    } catch (lookupError) {
      console.error("District tap lookup failed:", lookupError);
      setError("Something went wrong. You can still try ZIP lookup.");
    } finally {
      setLoading(false);
    }
  };

  const [resolvedState, setResolvedState] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 4,
        continueLabel: "Continue",
        continueDisabled: true,
        onContinue: () => router.push("/onboarding/pick-items" as any),
        onBack: () => router.back(),
        onSkip: () => {
          setUserRepBioguideId(null);
          setFoundRepBioguideId(null);
          router.push("/onboarding/pick-items" as any);
        },
      });

      if (
        priorityState &&
        !rep &&
        (SINGLE_REP_STATES.has(priorityState) || TERRITORIES.has(priorityState))
      ) {
        autoLookupAtLargeRep();
      }
    }, [priorityState]),
  );

  useEffect(() => {
    setOverlayConfig({
      dotIndex: 4,
      continueLabel: "Continue",
      continueDisabled: rep === null,
      onContinue: () => router.push("/onboarding/pick-items" as any),
      onBack: () => router.back(),
      onSkip: () => {
        setUserRepBioguideId(null);
        setFoundRepBioguideId(null);
        router.push("/onboarding/pick-items" as any);
      },
    });
  }, [rep]);

  const lookupRep = async () => {
    if (zip.length !== 5) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }
    setLoading(true);
    setError(null);
    setRep(null);
    setDistrictSelection(null);
    setMultipleReps([]);
    setShowAllReps(false);

    try {
      const res = await fetch(
        `https://unum-production.up.railway.app/api/zip-districts/${zip}`,
      );

      if (!res.ok) {
        setError("Couldn't locate that zip code. Try another.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const districts: { state: string; district: number }[] = data.districts;

      if (!districts?.length) {
        setError(
          "Couldn't find a congressional district for that zip. Try another.",
        );
        setLoading(false);
        return;
      }

      // Warn if zip's state differs from selected priority state
      const resolvedStateAbbr = districts[0].state;
      setResolvedState(resolvedStateAbbr);
      if (stateAbbrForLookup && resolvedStateAbbr !== stateAbbrForLookup) {
        setStateMismatch(true);
      } else {
        setStateMismatch(false);
      }

      // Load officials and match ALL returned districts
      const officialsData = await officialsService.getAll();
      const officials = officialsData.officials as any[];

      const buildRepResult = (o: any, resolvedAbbr: string): RepResult => ({
        bioguideId: o.bioguideId,
        name: formatName(o.name),
        party:
          o.partyName ??
          o.terms?.item?.[o.terms.item.length - 1]?.partyName ??
          "Unknown",
        role: (() => {
          const state = ABBR_TO_STATE[resolvedAbbr] ?? resolvedAbbr;
          const district = o.district ? `, District ${o.district}` : "";
          const full = `Representative, ${state}${district}`;
          const abbr = `Rep, ${state}${district}`;
          if (screenWidth < 390) return abbr;
          return full.length > 39 ? abbr : full;
        })(),
        photoUrl: `https://bioguide.congress.gov/bioguide/photo/${o.bioguideId[0]}/${o.bioguideId}.jpg`,
      });

      // Find a rep for each district returned, deduplicate by bioguideId
      const seen = new Set<string>();
      const matched: RepResult[] = [];

      for (const { state, district } of districts) {
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
            officialStateAbbr === state &&
            officialDistrict === district
          );
        });

        if (match && !seen.has(match.bioguideId)) {
          seen.add(match.bioguideId);
          matched.push(buildRepResult(match, state));
        }
      }

      if (matched.length === 0) {
        setError(
          "Found your district but couldn't match to our database. You can skip this step.",
        );
        setLoading(false);
        return;
      }

      // First match is the primary
      setRep(matched[0]);
      setFoundRepBioguideId(matched[0].bioguideId);

      if (matched.length > 1) {
        setMultipleReps(matched);
      } else {
        setMultipleReps([]);
      }
    } catch (e) {
      console.error("Rep lookup error:", e);
      setError("Something went wrong. You can skip this step.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRep = () => {
    if (!rep) return;
    if (repSelected) {
      setRepSelected(false);
      setSelectedRepId(null);
      setUserRepBioguideId(null);
      setSelectedOfficials(
        selectedOfficials.filter((id) => id !== rep.bioguideId),
      );
    } else {
      setRepSelected(true);
      setSelectedRepId(rep.bioguideId);
      setUserRepBioguideId(rep.bioguideId);
      if (!selectedOfficials.includes(rep.bioguideId)) {
        setSelectedOfficials([...selectedOfficials, rep.bioguideId]);
      }
    }
  };

  const selectSpecificRep = (chosen: RepResult) => {
    setRep(chosen);
    setRepSelected(true);
    setSelectedRepId(chosen.bioguideId);
    setUserRepBioguideId(chosen.bioguideId);
    setFoundRepBioguideId(chosen.bioguideId);
    const filtered = selectedOfficials.filter((id) =>
      multipleReps.every((r) => r.bioguideId !== id),
    );
    setSelectedOfficials([...filtered, chosen.bioguideId]);
    setShowAllReps(false);
  };

  const autoLookupAtLargeRep = async () => {
    if (!priorityState) return;
    setLoading(true);
    setError(null);
    setRep(null);
    setDistrictSelection(null);

    try {
      const stateAbbr =
        STATE_TO_ABBR[priorityState] ?? TERRITORY_TO_ABBR[priorityState];

      const officialsData = await officialsService.getAll();
      const officials = officialsData.officials as any[];

      const match = officials.find((o) => {
        const termInfo = o.terms?.item?.[o.terms.item.length - 1];
        const isHouse =
          termInfo?.chamber === "House of Representatives" ||
          o.chamber === "House of Representatives";
        const officialStateAbbr = o.state
          ? (STATE_TO_ABBR[o.state] ?? TERRITORY_TO_ABBR[o.state])
          : null;
        return isHouse && officialStateAbbr === stateAbbr;
      });

      if (!match) {
        setError(
          "Couldn't find a delegate for this state in our database. You can skip this step.",
        );
        return;
      }

      const resolved = stateAbbr ?? "";
      setResolvedState(resolved);
      setRep({
        bioguideId: match.bioguideId,
        name: formatName(match.name),
        party:
          match.partyName ??
          match.terms?.item?.[match.terms.item.length - 1]?.partyName ??
          "Unknown",
        role: (() => {
          const district = match.district ? `, District ${match.district}` : "";
          const full = `Representative, ${priorityState}${district}`;
          const abbr = `Rep, ${priorityState}${district}`;
          if (screenWidth < 390) return abbr;
          return full.length > 39 ? abbr : full;
        })(),
        photoUrl: `https://bioguide.congress.gov/bioguide/photo/${match.bioguideId[0]}/${match.bioguideId}.jpg`,
      });
      setFoundRepBioguideId(match.bioguideId);
    } catch (e) {
      console.error("Auto rep lookup error:", e);
      setError("Something went wrong. You can skip this step.");
    } finally {
      setLoading(false);
    }
  };

  const partyColor = rep ? (PARTY_COLORS[rep.party] ?? "#535353") : "#535353";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 }}
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
          Find your representative
        </Text>
        <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
          {TERRITORIES.has(priorityState ?? "")
            ? `${priorityState} has a non-voting delegate to the House of Representatives instead of a senator or voting rep.`
            : SINGLE_REP_STATES.has(priorityState ?? "")
              ? `${priorityState} has only one House representative for the whole state, so no zip code is needed.`
              : familiarityLevel === "low"
                ? "Your zip code tells us exactly which representative represents your particular neighborhood in the House of Representatives."
                : familiarityLevel === "high"
                  ? "Look up your House rep by zip code."
                  : "Enter your zip code and we'll find the House representative for your district."}
          {resolvedState &&
          !SINGLE_REP_STATES.has(priorityState ?? "") &&
          !TERRITORIES.has(priorityState ?? "")
            ? ` Your senators from ${priorityState} will be added automatically.`
            : ""}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 12,
          paddingBottom: 160,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {!SINGLE_REP_STATES.has(priorityState ?? "") &&
          !TERRITORIES.has(priorityState ?? "") && (
            <CongressionalDistrictMap
              stateAbbr={stateAbbrForLookup}
              onSelectDistrict={matchDistrictToRep}
            />
          )}

        {/* Only show zip input for normal multi-rep states */}
        {!SINGLE_REP_STATES.has(priorityState ?? "") &&
          !TERRITORIES.has(priorityState ?? "") && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                value={zip}
                onChangeText={(t) => {
                  setZip(t.replace(/[^0-9]/g, "").slice(0, 5));
                  setError(null);
                  setRep(null);
                  setDistrictSelection(null);
                  setRepSelected(false);
                }}
                onSubmitEditing={lookupRep}
                placeholder="Enter your zip code"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                returnKeyType="search"
                maxLength={5}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 14,
                  fontSize: 16,
                  color: "#1a1a1a",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              />
              {loading && (
                <View
                  style={{ justifyContent: "center", paddingHorizontal: 8 }}
                >
                  <ActivityIndicator color="#008CFF" />
                </View>
              )}
            </View>
          )}
        {/* Loading spinner for auto-lookup states */}
        {loading &&
          (SINGLE_REP_STATES.has(priorityState ?? "") ||
            TERRITORIES.has(priorityState ?? "")) && (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <ActivityIndicator color="#008CFF" />
            </View>
          )}
        {error && (
          <Text
            style={{ fontSize: 13, color: "#D45252", paddingHorizontal: 4 }}
          >
            {error}
          </Text>
        )}
        {stateMismatch && !error && (
          <View
            style={{
              backgroundColor: "#FFF8E7",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#F5A623",
            }}
          >
            <Text style={{ fontSize: 13, color: "#8B6914" }}>
              This zip code is from a different state than the one you selected.
            </Text>
          </View>
        )}
        {districtSelection && !error && (
          <View
            style={{
              backgroundColor: "#EEF7FF",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#B7D7F5",
            }}
          >
            <Text style={{ fontSize: 13, color: "#005EA8", lineHeight: 18 }}>
              Selected {districtSelection.label}. The matching representative is
              shown below.
            </Text>
          </View>
        )}
        {rep && (
          <Pressable
            onPress={toggleRep}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: repSelected ? "#E8F4FF" : "#fff",
              borderRadius: 24,
              padding: 14,
              borderWidth: 2,
              borderColor: repSelected ? "#008CFF" : "transparent",
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
              <Image
                source={{ uri: rep.photoUrl }}
                style={{ width: "100%", height: "120%" }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flex: 1 }}>
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
                  style={{ fontSize: 11, color: "#008CFF", fontWeight: "600" }}
                >
                  {TERRITORIES.has(priorityState ?? "")
                    ? "Your Delegate"
                    : multipleReps.length > 1
                      ? "Best Match"
                      : "Your Representative"}
                </Text>
              </View>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#535353" }}
              >
                {rep.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Text style={{ fontSize: 13, color: "#7B7C81" }}>
                  {PARTY_ABBR[rep.party] ?? rep.party}
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
                  {rep.role}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: repSelected ? "#008CFF" : "#ccc",
                backgroundColor: repSelected ? "#008CFF" : "transparent",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 8,
              }}
            >
              {repSelected && (
                <Text
                  style={{ color: "white", fontSize: 13, fontWeight: "700" }}
                >
                  ✓
                </Text>
              )}
            </View>
          </Pressable>
        )}
        {/* Multiple reps section — shown when zip crosses district lines */}
        {multipleReps.length > 1 && (
          <View>
            <View
              style={{
                backgroundColor: "#FFF8E1",
                borderRadius: 12,
                padding: 12,
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 13, color: "#7A5C00", lineHeight: 18 }}>
                Zip codes sometimes cross district lines due to gerrymandering.
                If the match above doesn't look right, select your actual
                representative below.
              </Text>
            </View>
            <Pressable
              onPress={() => setShowAllReps(!showAllReps)}
              style={{ paddingVertical: 12, alignItems: "center" }}
            >
              <Text
                style={{ fontSize: 13, color: "#008CFF", fontWeight: "600" }}
              >
                {showAllReps
                  ? "Hide other representatives"
                  : `See all ${multipleReps.length} representatives from this zip code`}
              </Text>
            </Pressable>
            {showAllReps &&
              multipleReps
                .filter((r) => r.bioguideId !== rep?.bioguideId)
                .map((r) => (
                  <Pressable
                    key={r.bioguideId}
                    onPress={() => selectSpecificRep(r)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor:
                        selectedRepId === r.bioguideId ? "#E8F4FF" : "#fff",
                      borderRadius: 24,
                      padding: 14,
                      borderWidth: 2,
                      borderColor:
                        selectedRepId === r.bioguideId
                          ? "#008CFF"
                          : "transparent",
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: 2,
                      marginBottom: 8,
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
                      <Image
                        source={{ uri: r.photoUrl }}
                        style={{ width: "100%", height: "120%" }}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#535353",
                        }}
                      >
                        {r.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: "#7B7C81" }}>
                          {PARTY_ABBR[r.party] ?? r.party}
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
                          {r.role}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor:
                          selectedRepId === r.bioguideId ? "#008CFF" : "#ccc",
                        backgroundColor:
                          selectedRepId === r.bioguideId
                            ? "#008CFF"
                            : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: 8,
                      }}
                    >
                      {selectedRepId === r.bioguideId && (
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
                ))}
          </View>
        )}
        {!rep && !loading && !error && (
          <Text
            style={{
              fontSize: 13,
              color: "#aaa",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            You can skip this step if you prefer.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
