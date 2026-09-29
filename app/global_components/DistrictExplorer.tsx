import { useRouter } from "expo-router";
import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { geocodeAddressToDistrict } from "../services/censusGeocoding";
import { officialsService } from "../services/officials";
import CongressionalDistrictMap, {
    type DistrictSelection,
    type FocusDistrict,
    type PinLocation,
} from "./CongressionalDistrictMap";

type MatchedRep = {
  bioguideId: string;
  name: string;
  party: string;
  district: number;
  state: string;
  photoUrl: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  // State name to start the map on (e.g. the Officials tab's selected state)
  initialState?: string | null;
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

const STATE_TO_ABBR: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(STATE_ABBR_TO_STATE).map(([abbr, state]) => [state, abbr]),
  ),
  // Territories appear in officials data but have no state filter entry
  "American Samoa": "AS",
  Guam: "GU",
  "Northern Mariana Islands": "MP",
  "Puerto Rico": "PR",
  "U.S. Virgin Islands": "VI",
  "Virgin Islands": "VI",
};

const STATES = Object.values(STATE_ABBR_TO_STATE).sort();

const PARTY_ABBR: Record<string, string> = {
  Democratic: "D",
  Republican: "R",
  Independent: "I",
  Democrat: "D",
};

const API_BASE = "https://unum-production.up.railway.app";

const formatName = (name: string): string =>
  name.includes(",") ? name.split(",").reverse().join(" ").trim() : name;

function findHouseRep(
  officials: any[],
  stateAbbr: string,
  district: number,
): MatchedRep | null {
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
      isHouse && officialStateAbbr === stateAbbr && officialDistrict === district
    );
  });
  if (!match) return null;

  return {
    bioguideId: match.bioguideId,
    name: formatName(match.name),
    party:
      match.partyName ??
      match.terms?.item?.[match.terms.item.length - 1]?.partyName ??
      "Unknown",
    district,
    state: stateAbbr,
    photoUrl: `https://bioguide.congress.gov/bioguide/photo/${match.bioguideId[0]}/${match.bioguideId}.jpg`,
  };
}

export default function DistrictExplorer({
  visible,
  onClose,
  initialState,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictSelection | null>(null);
  const [matchedRep, setMatchedRep] = useState<MatchedRep | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStates, setShowStates] = useState(false);

  const [zip, setZip] = useState("");
  const [zipSearching, setZipSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSearching, setAddressSearching] = useState(false);
  const [focusDistricts, setFocusDistricts] = useState<FocusDistrict[] | null>(
    null,
  );
  const [pinLocation, setPinLocation] = useState<PinLocation | null>(null);
  // District found by address search. Map taps aren't fed back in, since
  // changing this reloads the map.
  const [addressGeoid, setAddressGeoid] = useState<string | null>(null);

  // Start on the state the Officials tab is showing, if it's a state
  useEffect(() => {
    if (!visible) return;
    if (initialState && STATE_TO_ABBR[initialState] && !focusDistricts) {
      setSelectedState(initialState);
    }
  }, [visible]);

  const resetResults = () => {
    setSelectedDistrict(null);
    setMatchedRep(null);
    setFocusDistricts(null);
    setPinLocation(null);
    setAddressGeoid(null);
    setSearchError(null);
  };

  const handleSelectDistrict = useCallback(
    async (district: DistrictSelection) => {
      setSelectedDistrict(district);
      setLoading(true);
      setMatchedRep(null);

      try {
        const officialsData = await officialsService.getAll();
        setMatchedRep(
          findHouseRep(
            officialsData.officials as any[],
            district.stateAbbr,
            district.district,
          ),
        );
      } catch (error) {
        console.error("Failed to match district to representative:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleZipSearch = useCallback(async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setSearchError("Enter a valid 5-digit zip code.");
      return;
    }

    setZipSearching(true);
    resetResults();

    try {
      const res = await fetch(`${API_BASE}/api/zip-districts/${trimmed}`);
      if (!res.ok) {
        setSearchError("Couldn't find that zip code. Try another.");
        return;
      }

      const data = await res.json();
      const districts: { state: string; district: number }[] = data.districts;

      if (!districts?.length) {
        setSearchError("No congressional district found for that zip code.");
        return;
      }

      setSelectedState(STATE_ABBR_TO_STATE[districts[0].state] ?? null);
      // One district is auto-selected by the map; several are highlighted
      // for the user to pick from.
      setFocusDistricts(
        districts.map((d) => ({ stateAbbr: d.state, district: d.district })),
      );
    } catch (err) {
      console.error("Zip lookup failed:", err);
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setZipSearching(false);
    }
  }, [zip]);

  const handleAddressSearch = useCallback(async () => {
    const trimmed = addressQuery.trim();
    if (!trimmed) {
      setSearchError("Enter a street address first.");
      return;
    }

    setAddressSearching(true);
    resetResults();

    try {
      const result = await geocodeAddressToDistrict(trimmed);
      if (!result) {
        setSearchError(
          "Couldn't find that address. Try including the city and state.",
        );
        return;
      }

      setSelectedState(STATE_ABBR_TO_STATE[result.stateAbbr] ?? null);
      setPinLocation({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setAddressGeoid(result.geoid);
      setFocusDistricts([
        { stateAbbr: result.stateAbbr, district: result.district },
      ]);
      await handleSelectDistrict({
        geoid: result.geoid,
        stateAbbr: result.stateAbbr,
        district: result.district,
        label: `${STATE_ABBR_TO_STATE[result.stateAbbr] ?? result.stateAbbr}, ${
          result.district === 0 ? "At-Large" : `District ${result.district}`
        }`,
      });
    } catch (error) {
      console.error("Address lookup failed:", error);
      setSearchError("Couldn't look up that address. Please try again.");
    } finally {
      setAddressSearching(false);
    }
  }, [addressQuery, handleSelectDistrict]);

  const openOfficial = (bioguideId: string) => {
    onClose();
    router.push(`/official/${bioguideId}` as any);
  };

  const multipleDistricts = (focusDistricts?.length ?? 0) > 1;

  const searchField = (props: {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    placeholder: string;
    searching: boolean;
    canSubmit: boolean;
    numeric?: boolean;
  }) => (
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
        placeholder={props.placeholder}
        placeholderTextColor="#bbb"
        keyboardType={props.numeric ? "number-pad" : "default"}
        maxLength={props.numeric ? 5 : undefined}
        value={props.value}
        onChangeText={props.onChangeText}
        onSubmitEditing={props.onSubmit}
        returnKeyType="search"
      />
      {props.value.length > 0 && (
        <Pressable onPress={props.onClear} hitSlop={8}>
          <X size={18} color="#999" />
        </Pressable>
      )}
      {props.searching ? (
        <ActivityIndicator
          size="small"
          color="#008CFF"
          style={{ marginLeft: 8 }}
        />
      ) : (
        <Pressable
          onPress={props.onSubmit}
          style={({ pressed }) => ({
            marginLeft: 8,
            backgroundColor: props.canSubmit ? "#008CFF" : "#E0E0E0",
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 8,
            opacity: pressed ? 0.8 : 1,
          })}
          disabled={!props.canSubmit}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: props.canSubmit ? "#fff" : "#999",
            }}
          >
            Search
          </Text>
        </Pressable>
      )}
    </View>
  );

  const sectionLabel = (text: string) => (
    <Text
      style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 8,
      }}
    >
      {text}
    </Text>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fafafa" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 16 }}>
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
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => ({
              marginTop: 6,
              transform: [{ scale: pressed ? 0.85 : 1 }],
            })}
          >
            <X size={28} color="#535353" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 48,
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Address Search */}
          <View>
            {sectionLabel("Search by address")}
            {searchField({
              value: addressQuery,
              onChangeText: (text) => {
                setAddressQuery(text);
                if (searchError) setSearchError(null);
              },
              onSubmit: handleAddressSearch,
              onClear: () => setAddressQuery(""),
              placeholder: "e.g. 1600 Pennsylvania Ave NW, Washington, DC",
              searching: addressSearching,
              canSubmit: !!addressQuery.trim(),
            })}
            <Text
              style={{
                fontSize: 12,
                color: "#7B7C81",
                marginTop: 6,
                marginLeft: 4,
              }}
            >
              A street address pinpoints your exact district using the U.S.
              Census Bureau geocoder.
            </Text>
          </View>

          {/* Zip Code Search */}
          <View>
            {sectionLabel("Search by zip code")}
            {searchField({
              value: zip,
              onChangeText: (text) => {
                setZip(text.replace(/[^0-9]/g, ""));
                if (searchError) setSearchError(null);
              },
              onSubmit: handleZipSearch,
              onClear: () => {
                setZip("");
                resetResults();
              },
              placeholder: "e.g. 10001",
              searching: zipSearching,
              canSubmit: zip.length === 5,
              numeric: true,
            })}
            {searchError && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#D45252",
                  marginTop: 6,
                  marginLeft: 4,
                }}
              >
                {searchError}
              </Text>
            )}
          </View>

          {/* State Selector */}
          <View>
            {sectionLabel("Select a state (optional)")}
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
                  {[null, ...STATES].map((state) => (
                    <Pressable
                      key={state ?? "all"}
                      onPress={() => {
                        setSelectedState(state);
                        setShowStates(false);
                        setZip("");
                        resetResults();
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
                        {state ?? "All U.S. districts"}
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
            focusDistricts={focusDistricts}
            autoSelectFocus={!multipleDistricts}
            selectedGeoid={addressGeoid}
            pinLocation={pinLocation}
          />

          {multipleDistricts && !selectedDistrict && (
            <View
              style={{
                backgroundColor: "#FFF8E1",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 13, color: "#7A5C00", lineHeight: 18 }}>
                This zip code spans {focusDistricts?.length} districts. Tap the
                one you live in, or search your street address above for an
                exact match.
              </Text>
            </View>
          )}

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
              <Text
                style={{ fontSize: 13, color: "#005EA8", fontWeight: "600" }}
              >
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
              onPress={() => openOfficial(matchedRep.bioguideId)}
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
                <Image
                  source={{ uri: matchedRep.photoUrl }}
                  style={{ width: "100%", height: "120%" }}
                  resizeMode="cover"
                />
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
                    {matchedRep.district === 0
                      ? "At-Large"
                      : `District ${matchedRep.district}`}
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
                Couldn't find a representative for this district in our
                database.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
