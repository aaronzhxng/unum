import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

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

const PARTY_COLORS: Record<string, string> = {
  Democrat: "#008CFF",
  Republican: "#D45252",
  Independent: "#F5A623",
};

interface RepResult {
  bioguideId: string;
  name: string;
  party: string;
  role: string;
  photoUrl: string;
}

export default function PickRepScreen() {
  const router = useRouter();
  const {
    priorityState,
    setUserRepBioguideId,
    setSelectedOfficials,
    selectedOfficials,
    setOverlayConfig,
  } = useOnboarding();

  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rep, setRep] = useState<RepResult | null>(null);
  const [repSelected, setRepSelected] = useState(false);

  const stateAbbrForLookup = priorityState
    ? STATE_TO_ABBR[priorityState]
    : null;

  const [resolvedState, setResolvedState] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setOverlayConfig({
        dotIndex: 4,
        continueLabel: "Continue",
        onContinue: () => router.push("/onboarding/pick-items" as any),
        onBack: () => router.back(),
        onSkip: () => router.push("/onboarding/pick-items" as any),
      });
    }, []),
  );

  const lookupRep = async () => {
    if (zip.length !== 5) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }
    setLoading(true);
    setError(null);
    setRep(null);

    try {
      // Step 1: Zip → lat/lng via Census geocoder (no key needed)
      const geoRes = await fetch(
        `https://geocoding.geo.census.gov/geocoder/locations/address?street=&city=&state=&zip=${zip}&benchmark=Public_AR_Current&format=json`,
      );
      const geoData = await geoRes.json();
      const coords = geoData?.result?.addressMatches?.[0]?.coordinates;

      if (!coords) {
        setError("Couldn't locate that zip code. Try another.");
        setLoading(false);
        return;
      }

      // Step 2: lat/lng → congressional district via Census
      const districtRes = await fetch(
        `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${coords.x}&y=${coords.y}&benchmark=Public_AR_Current&vintage=Current_Current&layers=54&format=json`,
      );
      const districtData = await districtRes.json();
      const districts =
        districtData?.result?.geographies?.["119th Congressional Districts"];

      if (!districts?.length) {
        setError(
          "Couldn't find a congressional district for that zip. Try another.",
        );
        setLoading(false);
        return;
      }

      const districtNum = parseInt(districts[0].CD119FP, 10);
      const resolved = stateAbbrForLookup ?? districts[0].STUSAB;
      setResolvedState(resolved);
      console.log("District number:", districtNum);
      console.log("Resolved state:", resolved);
      console.log("Raw district data:", JSON.stringify(districts[0], null, 2));

      // Step 3: Match against Railway officials
      const railwayRes = await fetch(
        `https://unum-production.up.railway.app/api/officials`,
      );
      const railwayData = await railwayRes.json();

      const match = (railwayData.officials ?? []).find((o: any) => {
        const termInfo = o.terms?.item?.[o.terms.item.length - 1];
        const isHouse =
          termInfo?.chamber === "House of Representatives" ||
          o.chamber === "House of Representatives";
        const officialState = o.state ?? termInfo?.stateCode;
        const officialDistrict = parseInt(o.district ?? termInfo?.district, 10);
        return (
          isHouse &&
          officialState === resolved &&
          officialDistrict === districtNum
        );
      });

      if (!match) {
        setError(
          "Found your district but couldn't match to our database. You can skip this step.",
        );
        setLoading(false);
        return;
      }

      setRep({
        bioguideId: match.bioguideId,
        name: match.name,
        party:
          match.terms?.item?.[match.terms.item.length - 1]?.partyName ??
          "Unknown",
        role: `Representative · ${priorityState ?? resolved}`,
        photoUrl: `https://bioguide.congress.gov/bioguide/photo/${match.bioguideId[0]}/${match.bioguideId}.jpg`,
      });
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
      setUserRepBioguideId(null);
      setSelectedOfficials(
        selectedOfficials.filter((id) => id !== rep.bioguideId),
      );
    } else {
      setRepSelected(true);
      setUserRepBioguideId(rep.bioguideId);
      if (!selectedOfficials.includes(rep.bioguideId)) {
        setSelectedOfficials([...selectedOfficials, rep.bioguideId]);
      }
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
          Enter your zip code and we'll find the House representative for your
          district.
          {resolvedState
            ? ` Your senators from ${priorityState} will be added automatically.`
            : ""}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        {/* Zip input row */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            value={zip}
            onChangeText={(t) => {
              setZip(t.replace(/[^0-9]/g, "").slice(0, 5));
              setError(null);
              setRep(null);
              setRepSelected(false);
            }}
            placeholder="Enter zip code"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            maxLength={5}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#1a1a1a",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          />
          <Pressable
            onPress={lookupRep}
            disabled={loading || zip.length !== 5}
            style={({ pressed }) => ({
              backgroundColor: zip.length === 5 ? "#008CFF" : "#ccc",
              borderRadius: 16,
              paddingHorizontal: 20,
              justifyContent: "center",
              alignItems: "center",
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
                Find
              </Text>
            )}
          </Pressable>
        </View>

        {/* Error */}
        {error && (
          <Text
            style={{ fontSize: 13, color: "#D45252", paddingHorizontal: 4 }}
          >
            {error}
          </Text>
        )}

        {/* Rep card */}
        {rep && (
          <Pressable
            onPress={toggleRep}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: repSelected ? "#E8F4FF" : "#fff",
              borderRadius: 16,
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
            {/* Photo */}
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
              {/* "Your representative" badge */}
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
                  Your Representative
                </Text>
              </View>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a" }}
              >
                {rep.name}
              </Text>
              <Text style={{ fontSize: 13, color: "#535353", marginTop: 2 }}>
                {rep.party} · {rep.role}
              </Text>
            </View>

            {/* Checkbox */}
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

        {/* Helper text when no search yet */}
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
      </View>
    </KeyboardAvoidingView>
  );
}
