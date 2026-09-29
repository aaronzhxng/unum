import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  "American Samoa": "AS",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Guam: "GU",
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
  "Northern Mariana Islands": "MP",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Puerto Rico": "PR",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  "U.S. Virgin Islands": "VI",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

// US territories have delegates/resident commissioners (House members), never senators
export const TERRITORY_STATES = new Set(["GU", "VI", "AS", "MP", "PR", "DC"]);

function formatRole(
  chamber: string,
  state: string,
  district?: number | null,
  screenWidth?: number,
): string {
  const baseThreshold = Platform.OS === "ios" ? 32 : 39;
  const threshold =
    screenWidth && screenWidth < 390 ? baseThreshold - 6 : baseThreshold;

  const stateAbbr = STATE_ABBR[state] ?? state;

  const isHouse =
    chamber === "House of Representatives" ||
    chamber === "House" ||
    TERRITORY_STATES.has(state) ||
    (!chamber?.toLowerCase().includes("senate") && district != null);

  if (isHouse) {
    const full = `Representative, ${state}${district ? `, District ${district}` : ""}`;
    const abbr = `Rep, ${state}${district ? `, District ${district}` : ""}`;
    const short = `Rep, ${stateAbbr}${district ? `, District ${district}` : ""}`;
    if (full.length <= threshold) return full;
    if (abbr.length <= threshold) return abbr;
    return short;
  }

  const full = `Senator, ${state}`;
  const abbr = `Sen, ${state}`;
  const short = `Sen, ${stateAbbr}`;
  if (full.length <= threshold + 1) return full;
  if (abbr.length <= threshold + 1) return abbr;
  return short;
}

// Official row used on the Officials tab and the congressional map. Omit
// onAddPress to hide the add-to-list button.
const OfficialCard = React.memo(function OfficialCard({
  item,
  onAddPress,
  plusRef,
}: {
  item: any;
  onAddPress?: (id: string) => void;
  plusRef?: React.RefObject<any>;
}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Pressable
      onPress={() => router.navigate(`/official/${item.bioguideId}`)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
        borderRadius: 48,
      })}
    >
      <View
        style={[
          componentStyles.officialCard,
          { paddingVertical: 16, borderWidth: 2, borderColor: "transparent" },
        ]}
      >
        {/* Avatar column — 64px wide, avatar 50px */}
        <View
          style={{
            width: 64,
            marginRight: 12,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              overflow: "hidden",
              backgroundColor: "#eee",
            }}
          >
            {item.depiction?.imageUrl && !imageError ? (
              <Image
                source={{ uri: item.depiction.imageUrl }}
                style={{ width: "100%", height: "120%" }}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#BFBFBF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  {item.name?.split(",")[0]?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* Official Info */}
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.name} numberOfLines={1}>
            {item.name?.includes(",")
              ? item.name
                  .split(",")
                  .reverse()
                  .map((s: string) => s.trim())
                  .join(" ")
              : item.name}
          </Text>
          <View style={[componentStyles.metaRow, { flexWrap: "nowrap" }]}>
            <Text style={[componentStyles.subtitle, { flexShrink: 0 }]}>
              {item.partyName?.charAt(0) || ""}
            </Text>
            <Text style={[componentStyles.separator, { flexShrink: 0 }]}>
              ·
            </Text>
            <Text
              style={[componentStyles.subtitle, { flexShrink: 1 }]}
              numberOfLines={1}
            >
              {formatRole(item.chamber, item.state, item.district, screenWidth)}
            </Text>
          </View>
        </View>
        {/* Plus Button */}
        {onAddPress && (
          <View ref={plusRef} collapsable={false}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onAddPress(item.bioguideId);
              }}
              style={({ pressed }) => ({
                padding: 8,
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })}
            >
              <Plus size={24} color="#008CFF" />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
});

export default OfficialCard;
