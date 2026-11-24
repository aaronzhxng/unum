import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
<<<<<<< HEAD
import { Search, X } from "lucide-react-native";
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
import { geocodeAddress } from "../services/osmGeocoding";
=======
import { Map as MapIcon } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useOnboarding } from "../context/OnboardingContext";
import type { FocusDistrict } from "../global_components/CongressionalDistrictMap";
import DistrictPickerModal from "../global_components/DistrictPickerModal";
import { officialsService } from "../services/officials";
import { houseTitle, roleOptionsFromText } from "../utils/officialTitle";
import FitText from "../global_components/FitText";
>>>>>>> origin/master

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

// Two-letter code for a state or territory name
const toAbbr = (name: string): string | undefined =>
  STATE_TO_ABBR[name] ?? TERRITORY_TO_ABBR[name];

// "Virgin Islands" is only an alias the officials data uses; display the
// name the state picker shows
const ABBR_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries({ ...STATE_TO_ABBR, ...TERRITORY_TO_ABBR })
    .filter(([state]) => state !== "Virgin Islands")
    .map(([state, abbr]) => [abbr, state]),
);

interface RepResult {
  bioguideId: string;
  name: string;
  party: string;
  role: string;
  photoUrl: string;
}

<<<<<<< HEAD
interface DistrictSelection {
  geoid: string;
  stateAbbr: string;
  district: number;
  label: string;
}
=======
const isHouseMemberFor = (o: any, state: string, district: number) => {
  const termInfo = o.terms?.item?.[o.terms.item.length - 1];
  const isHouse =
    termInfo?.chamber === "House of Representatives" ||
    o.chamber === "House of Representatives";
  const officialStateAbbr = o.state ? toAbbr(o.state) : null;
  const officialDistrict = parseInt(
    termInfo?.district ?? o.district ?? "0",
    10,
  );
  return (
    isHouse && officialStateAbbr === state && officialDistrict === district
  );
};
>>>>>>> origin/master

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
  const [addressQuery, setAddressQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [addressSearching, setAddressSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Notice for a seat that was found but nobody holds right now
  const [vacancy, setVacancy] = useState<string | null>(null);
  const [rep, setRep] = useState<RepResult | null>(null);
  const [repSelected, setRepSelected] = useState(false);
  const [stateMismatch, setStateMismatch] = useState(false);
  const [multipleReps, setMultipleReps] = useState<RepResult[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [showAllReps, setShowAllReps] = useState(false);
<<<<<<< HEAD
  const [districtSelection, setDistrictSelection] =
    useState<DistrictSelection | null>(null);
  const { width: screenWidth } = useWindowDimensions();
=======
  const [zipDistricts, setZipDistricts] = useState<FocusDistrict[]>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const officialsRef = useRef<any[]>([]);
>>>>>>> origin/master

  const stateAbbrForLookup = priorityState ? toAbbr(priorityState) : null;

  const formatName = (name: string): string => {
    if (!name.includes(",")) return name;
    const [last, first] = name.split(",").map((s) => s.trim());
    return `${first} ${last}`;
  };

<<<<<<< HEAD
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
=======
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
      const title = houseTitle(state);
      // Written out in full; the card shortens it when it doesn't fit
      return `${title.full}, ${state}${district}`;
    })(),
    photoUrl: `https://bioguide.congress.gov/bioguide/photo/${o.bioguideId[0]}/${o.bioguideId}.jpg`,
  });

  // Rep for a district tapped on the map picker, from the officials list
  // loaded by the zip lookup
  const resolveMapRep = (state: string, district: number): RepResult | null => {
    const match = officialsRef.current.find((o) =>
      isHouseMemberFor(o, state, district),
    );
    return match ? buildRepResult(match, state) : null;
>>>>>>> origin/master
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

  const lookupRepForZipCode = async (zipCode: string) => {
    const trimmed = zipCode.trim();

    if (trimmed.length !== 5) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }
    setLoading(true);
    setError(null);
    setVacancy(null);
    setRep(null);
    setDistrictSelection(null);
    setMultipleReps([]);
    setShowAllReps(false);

    try {
      const res = await fetch(
        `https://unum-production.up.railway.app/api/zip-districts/${trimmed}`,
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
      setZipDistricts(
        districts.map((d) => ({ stateAbbr: d.state, district: d.district })),
      );
      if (stateAbbrForLookup && resolvedStateAbbr !== stateAbbrForLookup) {
        setStateMismatch(true);
      } else {
        setStateMismatch(false);
      }

      // Load officials and match ALL returned districts
      const officialsData = await officialsService.getAll();
      const officials = officialsData.officials as any[];
      officialsRef.current = officials;

      // Find a rep for each district returned, deduplicate by bioguideId
      const seen = new Set<string>();
      const matched: RepResult[] = [];

      for (const { state, district } of districts) {
        const match = officials.find((o) =>
          isHouseMemberFor(o, state, district),
        );

        if (match && !seen.has(match.bioguideId)) {
          seen.add(match.bioguideId);
          matched.push(buildRepResult(match, state));
        }
      }

      if (matched.length === 0) {
        // Same wording as the congressional map's notice for an empty seat
        setVacancy(
          "This district doesn't currently have a representative. The seat may be vacant until a special election fills it, or the district may have recently been redrawn.",
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

  const lookupRep = async () => {
    await lookupRepForZipCode(zip);
  };

  const handleAddressSearch = async () => {
    const trimmed = addressQuery.trim();

    if (!trimmed) {
      setError("Enter an address or ZIP code first.");
      return;
    }

    setAddressSearching(true);
    setError(null);
    setRep(null);
    setDistrictSelection(null);
    setMultipleReps([]);
    setShowAllReps(false);

    try {
      const location = await geocodeAddress(trimmed);

      if (!location?.postcode) {
        setError("Couldn't resolve a ZIP code for that address.");
        return;
      }

      setZip(location.postcode);
      await lookupRepForZipCode(location.postcode);
    } catch (lookupError) {
      console.error("Address lookup failed:", lookupError);
      setError("Something went wrong. You can still try ZIP lookup.");
    } finally {
      setAddressSearching(false);
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
    setVacancy(null);
    setRep(null);
    setDistrictSelection(null);

    try {
      const stateAbbr = toAbbr(priorityState);

      const officialsData = await officialsService.getAll();
      const officials = officialsData.officials as any[];

      const match = officials.find((o) => {
        const termInfo = o.terms?.item?.[o.terms.item.length - 1];
        const isHouse =
          termInfo?.chamber === "House of Representatives" ||
          o.chamber === "House of Representatives";
        const officialStateAbbr = o.state ? toAbbr(o.state) : null;
        return isHouse && officialStateAbbr === stateAbbr;
      });

      if (!match) {
        const place =
          priorityState === "District of Columbia" ? "DC" : priorityState;
        setVacancy(
          `${place} doesn't currently have a ${houseTitle(priorityState).full.toLowerCase()} in the House. The seat may be vacant until a special election fills it.`,
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
          const title = houseTitle(priorityState);
          // Written out in full; the card shortens it when it doesn't fit
          return `${title.full}, ${priorityState}${district}`;
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
            ? `${priorityState} has a non-voting ${houseTitle(priorityState).full.toLowerCase()} in the House of Representatives instead of senators or a voting representative.`
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
            <View style={{ marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: 8,
                }}
              >
                Search by address
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  shadowColor: "#000000",
                  shadowOpacity: 0.15,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Search size={18} color="#7B7C81" />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                    color: "#1a1a1a",
                  }}
                  placeholder="e.g. 1600 Pennsylvania Ave NW"
                  placeholderTextColor="#bbb"
                  value={addressQuery}
                  onChangeText={(text) => {
                    setAddressQuery(text);
                    if (error) setError(null);
                  }}
                  onSubmitEditing={handleAddressSearch}
                  returnKeyType="search"
                />
                {addressQuery.length > 0 && (
                  <Pressable onPress={() => setAddressQuery("")} hitSlop={8}>
                    <X size={18} color="#999" />
                  </Pressable>
                )}
                {addressSearching ? (
                  <ActivityIndicator
                    size="small"
                    color="#008CFF"
                    style={{ marginLeft: 8 }}
                  />
                ) : (
                  <Pressable
                    onPress={handleAddressSearch}
                    style={({ pressed }) => ({
                      marginLeft: 8,
                      backgroundColor: addressQuery.trim()
                        ? "#008CFF"
                        : "#E0E0E0",
                      borderRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      opacity: pressed ? 0.8 : 1,
                    })}
                    disabled={!addressQuery.trim()}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: addressQuery.trim() ? "#fff" : "#999",
                      }}
                    >
                      Search
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#7B7C81",
                  marginTop: 6,
                  marginLeft: 4,
                }}
              >
                OSM geocoding resolves the address to a ZIP code, then we match
                the district.
              </Text>
            </View>
          )}

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
                  setVacancy(null);
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
              {loading ? (
                <View
                  style={{ justifyContent: "center", paddingHorizontal: 8 }}
                >
                  <ActivityIndicator color="#008CFF" />
                </View>
              ) : (
                <Pressable
                  onPress={lookupRep}
                  style={({ pressed }) => ({
                    backgroundColor: zip.length === 5 ? "#008CFF" : "#d0d0d0",
                    borderRadius: 16,
                    paddingHorizontal: 18,
                    justifyContent: "center",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#fff",
                    }}
                  >
                    Find
                  </Text>
                </Pressable>
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
<<<<<<< HEAD
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
=======
        {vacancy && !error && (
          <View
            style={{
              backgroundColor: "#FFF8E7",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#F5A623",
            }}
          >
            <Text style={{ fontSize: 13, color: "#8B6914", lineHeight: 18 }}>
              {vacancy}
>>>>>>> origin/master
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
                    ? `Your ${houseTitle(priorityState).full}`
                    : multipleReps.length > 1 && !repSelected
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
                <FitText
                  style={{ fontSize: 13, color: "#7B7C81" }}
                  options={roleOptionsFromText(rep.role ?? "")}
                />
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
                Your zip code crosses more than one district. If the match above
                doesn't look right, select your actual representative below.
              </Text>
            </View>
            <Pressable
              onPress={() => setShowMapPicker(true)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#E8F4FF",
                borderRadius: 16,
                paddingVertical: 12,
                marginTop: 10,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <MapIcon size={18} color="#008CFF" />
              <Text
                style={{ fontSize: 14, color: "#008CFF", fontWeight: "600" }}
              >
                Not sure? Find your district on the map
              </Text>
            </Pressable>
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
                        <FitText
                          style={{ fontSize: 13, color: "#7B7C81" }}
                          options={roleOptionsFromText(r.role ?? "")}
                        />
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
        {!rep && !loading && (
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

      <DistrictPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        focusDistricts={zipDistricts}
        stateAbbr={resolvedState}
        resolveRep={resolveMapRep}
        onConfirm={(chosen) => {
          selectSpecificRep(chosen);
          setShowMapPicker(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
