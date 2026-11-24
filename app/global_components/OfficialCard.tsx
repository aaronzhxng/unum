import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";
import { roleOptions } from "../utils/officialTitle";
import FitText from "./FitText";

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

// House members include the territories' delegates, who never have senators
function isHouseMember(
  chamber: string,
  state: string,
  district?: number | null,
) {
  return (
    chamber === "House of Representatives" ||
    chamber === "House" ||
    TERRITORY_STATES.has(state) ||
    (!chamber?.toLowerCase().includes("senate") && district != null)
  );
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
  const house = isHouseMember(item.chamber, item.state, item.district);
  const [imageError, setImageError] = useState(false);

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
          {/* Their role on the committee being viewed, e.g. Chair */}
          {item.committeeTitle && (
            <View
              style={{
                alignSelf: "flex-start",
                paddingVertical: 2,
                paddingHorizontal: 8,
                // Hangs out by its padding, so the title lines up with the name
                marginLeft: -8,
                marginBottom: 4,
                borderRadius: 999,
                backgroundColor: "#E8F4FF",
              }}
            >
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: "#008CFF" }}
              >
                {item.committeeTitle}
              </Text>
            </View>
          )}
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
            {/* A state's reps share one form, and its senators another, on
                any list, so a long state elsewhere never shortens them */}
            <FitText
              style={componentStyles.subtitle}
              group={`${house ? "house" : "senate"}-${item.state}`}
              options={roleOptions({
                house,
                state: item.state,
                district: item.district,
              })}
            />
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
