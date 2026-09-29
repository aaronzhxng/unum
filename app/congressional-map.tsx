import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronDown, ChevronLeft, ChevronUp, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";
import CongressionalDistrictMap, {
    type DistrictSelection,
    type FocusDistrict,
    type PinLocation,
} from "./global_components/CongressionalDistrictMap";
import OfficialCard from "./global_components/OfficialCard";
import { geocodeAddressToDistrict } from "./services/censusGeocoding";
import { officialsService } from "./services/officials";
import { trySwipeBack } from "./utils/swipeBackGuard";

type SearchMode = "zip" | "address" | "state";

const SEARCH_MODES: { key: SearchMode; label: string }[] = [
  { key: "zip", label: "Zip code" },
  { key: "address", label: "Address" },
  { key: "state", label: "State" },
];

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

const API_BASE = "https://unum-production.up.railway.app";

// Returns the official as the officials list stores it, so it renders with
// the same card as the Officials tab
function findHouseRep(
  officials: any[],
  stateAbbr: string,
  district: number,
): any | null {
  return (
    officials.find((o) => {
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
    }) ?? null
  );
}

// Show a jump button once this far from the top or bottom of the page
const JUMP_THRESHOLD = 80;

// Matches the map's zoom buttons
const jumpButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#ffffff",
  justifyContent: "center" as const,
  alignItems: "center" as const,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 9,
  elevation: 6,
};

const sectionLabelStyle = {
  fontSize: 14,
  fontWeight: "600" as const,
  color: "#1a1a1a",
  marginBottom: 8,
};

const dropdownListStyle = {
  backgroundColor: "#fff",
  borderRadius: 16,
  marginTop: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
  overflow: "hidden" as const,
};

export default function CongressionalMapScreen() {
  const router = useRouter();
  // Opened from the Officials tab with its selected state, if any
  const { state: initialState } = useLocalSearchParams<{ state?: string }>();
  const startState =
    initialState && STATE_ABBR_TO_STATE[STATE_TO_ABBR[initialState]]
      ? initialState
      : null;
  const scrollRef = useRef<ScrollView>(null);

  const [searchMode, setSearchMode] = useState<SearchMode>("zip");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [zip, setZip] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [pendingState, setPendingState] = useState<string | null>(startState);
  const [showStates, setShowStates] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // What the map is currently showing
  const [selectedState, setSelectedState] = useState<string | null>(startState);
  const [focusDistricts, setFocusDistricts] = useState<FocusDistrict[] | null>(
    null,
  );
  const [pinLocation, setPinLocation] = useState<PinLocation | null>(null);
  // District found by address search. Map taps aren't fed back in, since
  // changing this reloads the map.
  const [addressGeoid, setAddressGeoid] = useState<string | null>(null);

  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictSelection | null>(null);
  const [matchedRep, setMatchedRep] = useState<any | null>(null);
  const [repLoading, setRepLoading] = useState(false);
  const [showJumpTop, setShowJumpTop] = useState(false);
  const [showJumpBottom, setShowJumpBottom] = useState(false);

  // Left-edge swipe goes back the same way as the back button. The native
  // stack gesture is disabled for this screen because it lets the tab
  // pager drift to Home.
  const backSwipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 50 && Math.abs(g.vx) > 0.3 && trySwipeBack()) router.back();
      },
    }),
  ).current;

  // Claim the OS-level back gesture too, so it doesn't pop twice
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (trySwipeBack()) router.back();
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  // The map takes most of the screen and pans with one finger, so the page
  // offers jump-to-top / jump-to-bottom buttons instead
  const scrollMetrics = useRef({ offset: 0, viewport: 0, content: 0 });
  const updateJumpButtons = () => {
    const { offset, viewport, content } = scrollMetrics.current;
    setShowJumpTop(offset > JUMP_THRESHOLD);
    setShowJumpBottom(
      viewport > 0 && offset + viewport < content - JUMP_THRESHOLD,
    );
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } =
      event.nativeEvent;
    scrollMetrics.current = {
      offset: contentOffset.y,
      viewport: layoutMeasurement.height,
      content: contentSize.height,
    };
    updateJumpButtons();
  };

  const resetResults = () => {
    setSelectedDistrict(null);
    setMatchedRep(null);
    setFocusDistricts(null);
    setPinLocation(null);
    setAddressGeoid(null);
    setSearchError(null);
  };

  // The map fills most of the screen, so bring the result into view
  useEffect(() => {
    if (selectedDistrict && !repLoading) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [selectedDistrict, repLoading]);

  const handleSelectDistrict = useCallback(
    async (district: DistrictSelection) => {
      setSelectedDistrict(district);
      setRepLoading(true);
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
        setRepLoading(false);
      }
    },
    [],
  );

  const searchByZip = async () => {
    const trimmed = zip.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      setSearchError("Enter a valid 5-digit zip code.");
      return;
    }

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
  };

  const searchByAddress = async () => {
    const trimmed = addressQuery.trim();
    if (!trimmed) {
      setSearchError("Enter a street address first.");
      return;
    }

    const result = await geocodeAddressToDistrict(trimmed);
    if (!result) {
      setSearchError(
        "Couldn't find that address. Try including the city and state.",
      );
      return;
    }

    setSelectedState(STATE_ABBR_TO_STATE[result.stateAbbr] ?? null);
    setPinLocation({ latitude: result.latitude, longitude: result.longitude });
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
  };

  const handleSearch = async () => {
    setShowModeMenu(false);
    setShowStates(false);
    resetResults();

    if (searchMode === "state") {
      setSelectedState(pendingState);
      return;
    }

    setSearching(true);
    try {
      if (searchMode === "zip") await searchByZip();
      else await searchByAddress();
    } catch (error) {
      console.error("District search failed:", error);
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const canSearch =
    searchMode === "zip"
      ? zip.length === 5
      : searchMode === "address"
        ? !!addressQuery.trim()
        : true;

  const multipleDistricts = (focusDistricts?.length ?? 0) > 1;
  const modeLabel =
    SEARCH_MODES.find((mode) => mode.key === searchMode)?.label ?? "";

  const textValue = searchMode === "zip" ? zip : addressQuery;
  const setTextValue = (text: string) => {
    if (searchMode === "zip") setZip(text.replace(/[^0-9]/g, ""));
    else setAddressQuery(text);
    if (searchError) setSearchError(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 56,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
            marginRight: 20,
          })}
        >
          <ChevronLeft size={24} color="#535353" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a" }}>
          Congressional Map
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 48, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        onLayout={(event) => {
          scrollMetrics.current.viewport = event.nativeEvent.layout.height;
          updateJumpButtons();
        }}
        onContentSizeChange={(_, height) => {
          scrollMetrics.current.content = height;
          updateJumpButtons();
        }}
        scrollEventThrottle={100}
      >
        {/* Search */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={sectionLabelStyle}>Find a district</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "stretch",
              backgroundColor: "#fff",
              borderRadius: 24,
              shadowColor: "#000000",
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Left: search type */}
            <Pressable
              onPress={() => {
                setShowModeMenu(!showModeMenu);
                setShowStates(false);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingLeft: 16,
                paddingRight: 12,
                borderRightWidth: 1,
                borderRightColor: "#EEEEEE",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a" }}
              >
                {modeLabel}
              </Text>
              {showModeMenu ? (
                <ChevronUp size={18} color="#7B7C81" />
              ) : (
                <ChevronDown size={18} color="#7B7C81" />
              )}
            </Pressable>

            {/* Right: text input, or state picker */}
            {searchMode === "state" ? (
              <Pressable
                onPress={() => {
                  setShowStates(!showStates);
                  setShowModeMenu(false);
                }}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  paddingHorizontal: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: pendingState ? "#1a1a1a" : "#999",
                  }}
                  numberOfLines={1}
                >
                  {pendingState ?? "All U.S. districts"}
                </Text>
                {showStates ? (
                  <ChevronUp size={20} color="#7B7C81" />
                ) : (
                  <ChevronDown size={20} color="#7B7C81" />
                )}
              </Pressable>
            ) : (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingRight: 14,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    color: "#1a1a1a",
                  }}
                  placeholder={
                    searchMode === "zip"
                      ? "e.g. 10001"
                      : "e.g. 1600 Pennsylvania Ave NW, Washington, DC"
                  }
                  placeholderTextColor="#bbb"
                  keyboardType={searchMode === "zip" ? "number-pad" : "default"}
                  maxLength={searchMode === "zip" ? 5 : undefined}
                  value={textValue}
                  onChangeText={setTextValue}
                  onFocus={() => setShowModeMenu(false)}
                  onSubmitEditing={() => canSearch && handleSearch()}
                  returnKeyType="search"
                />
                {textValue.length > 0 && (
                  <Pressable onPress={() => setTextValue("")} hitSlop={8}>
                    <X size={18} color="#999" />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {showModeMenu && (
            <View style={dropdownListStyle}>
              {SEARCH_MODES.map((mode) => (
                <Pressable
                  key={mode.key}
                  onPress={() => {
                    setSearchMode(mode.key);
                    setShowModeMenu(false);
                    setSearchError(null);
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f5f5f5",
                    backgroundColor: pressed
                      ? "#f0f8ff"
                      : searchMode === mode.key
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
                      fontWeight: searchMode === mode.key ? "600" : "400",
                    }}
                  >
                    {mode.label}
                  </Text>
                  {searchMode === mode.key && (
                    <Check size={18} color="#008CFF" strokeWidth={3} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {searchMode === "state" && showStates && (
            <View style={[dropdownListStyle, { maxHeight: 320 }]}>
              <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
                {[null, ...STATES].map((state) => (
                  <Pressable
                    key={state ?? "all"}
                    onPress={() => {
                      setPendingState(state);
                      setShowStates(false);
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f5f5f5",
                      backgroundColor: pressed
                        ? "#f0f8ff"
                        : pendingState === state
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
                        fontWeight: pendingState === state ? "600" : "400",
                      }}
                    >
                      {state ?? "All U.S. districts"}
                    </Text>
                    {pendingState === state && (
                      <Check size={18} color="#008CFF" strokeWidth={3} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {searchError && (
            <Text
              style={{
                fontSize: 12,
                color: "#D45252",
                marginTop: 8,
                marginLeft: 4,
              }}
            >
              {searchError}
            </Text>
          )}

          <Pressable
            onPress={handleSearch}
            disabled={!canSearch || searching}
            style={({ pressed }) => ({
              marginTop: 12,
              backgroundColor: canSearch ? "#008CFF" : "#E0E0E0",
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            {searching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: canSearch ? "#fff" : "#999",
                }}
              >
                Search
              </Text>
            )}
          </Pressable>
        </View>

        {/* Map */}
        <View>
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={sectionLabelStyle}>Tap a district</Text>
            <Text
              style={{
                fontSize: 13,
                color: "#7B7C81",
                lineHeight: 18,
                marginTop: -4,
                marginBottom: 12,
              }}
            >
              {multipleDistricts
                ? `This zip code spans ${focusDistricts?.length} districts. Tap the one you live in, or search by address for an exact match.`
                : "Tap any district to see who represents it."}
            </Text>
          </View>
          <CongressionalDistrictMap
            stateAbbr={selectedState ? STATE_TO_ABBR[selectedState] : null}
            onSelectDistrict={handleSelectDistrict}
            focusDistricts={focusDistricts}
            autoSelectFocus={!multipleDistricts}
            selectedGeoid={addressGeoid}
            pinLocation={pinLocation}
          />
        </View>

        {/* Result */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
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

          {repLoading && (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <ActivityIndicator color="#008CFF" />
            </View>
          )}

          {matchedRep && !repLoading && <OfficialCard item={matchedRep} />}

          {selectedDistrict && !matchedRep && !repLoading && (
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
        </View>
      </ScrollView>

      {/* Jump to top / bottom — the map pans with one finger, so these get
          the user past it */}
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", right: 16, bottom: 32, gap: 10 }}
      >
        {showJumpTop && (
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            accessibilityLabel="Scroll to top"
            style={({ pressed }) => [
              jumpButtonStyle,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
          >
            <ChevronUp size={22} color="#1a1a1a" />
          </Pressable>
        )}
        {showJumpBottom && (
          <Pressable
            onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
            accessibilityLabel="Scroll to bottom"
            style={({ pressed }) => [
              jumpButtonStyle,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
          >
            <ChevronDown size={22} color="#1a1a1a" />
          </Pressable>
        )}
      </View>

      {/* Left-edge swipe strip — matches router.back() like the back button */}
      <View
        {...backSwipePanResponder.panHandlers}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 20,
          zIndex: 10,
        }}
      />
    </KeyboardAvoidingView>
  );
}
