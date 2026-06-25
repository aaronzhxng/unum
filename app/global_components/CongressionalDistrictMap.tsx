import { geoIdentity, geoPath } from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";

type DistrictFeature = {
  type: "Feature";
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: any;
  };
  properties: {
    GEOID: string;
    STATE: string;
    BASENAME: string;
    NAME: string;
  };
};

type DistrictCollection = {
  type: "FeatureCollection";
  features: DistrictFeature[];
};

type DistrictSelection = {
  geoid: string;
  stateAbbr: string;
  district: number;
  label: string;
};

type Props = {
  stateAbbr?: string | null;
  onSelectDistrict: (district: DistrictSelection) => void;
};

const STATE_ABBR_TO_FIPS: Record<string, string> = {
  AL: "01",
  AK: "02",
  AZ: "04",
  AR: "05",
  CA: "06",
  CO: "08",
  CT: "09",
  DE: "10",
  DC: "11",
  FL: "12",
  GA: "13",
  HI: "15",
  ID: "16",
  IL: "17",
  IN: "18",
  IA: "19",
  KS: "20",
  KY: "21",
  LA: "22",
  ME: "23",
  MD: "24",
  MA: "25",
  MI: "26",
  MN: "27",
  MS: "28",
  MO: "29",
  MT: "30",
  NE: "31",
  NV: "32",
  NH: "33",
  NJ: "34",
  NM: "35",
  NY: "36",
  NC: "37",
  ND: "38",
  OH: "39",
  OK: "40",
  OR: "41",
  PA: "42",
  RI: "44",
  SC: "45",
  SD: "46",
  TN: "47",
  TX: "48",
  UT: "49",
  VT: "50",
  VA: "51",
  WA: "53",
  WV: "54",
  WI: "55",
  WY: "56",
  AS: "60",
  GU: "66",
  MP: "69",
  PR: "72",
  VI: "78",
};

const BASE_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/54/query";

function buildQueryUrl(stateAbbr?: string | null): string {
  const params = new URLSearchParams();
  const stateFips = stateAbbr ? STATE_ABBR_TO_FIPS[stateAbbr] : null;
  params.set(
    "where",
    stateFips
      ? `STATE='${stateFips}'`
      : "STATE NOT IN ('02','15','60','66','69','72','78')",
  );
  params.set("outFields", "GEOID,STATE,BASENAME,NAME");
  params.set("returnGeometry", "true");
  params.set("f", "geojson");
  params.set("outSR", "4326");
  params.set("geometryPrecision", "3");
  params.set("maxAllowableOffset", stateFips ? "0.005" : "0.02");
  return `${BASE_URL}?${params.toString()}`;
}

export default function CongressionalDistrictMap({
  stateAbbr,
  onSelectDistrict,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const mapWidth = Math.max(240, screenWidth - 64);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DistrictFeature[]>([]);
  const [selectedGEOID, setSelectedGEOID] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadMap = async () => {
      setLoading(true);
      setError(null);
      setSelectedGEOID(null);

      try {
        const response = await fetch(buildQueryUrl(stateAbbr), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load map data (${response.status})`);
        }

        const data = (await response.json()) as DistrictCollection;
        if (!active) return;
        setFeatures(Array.isArray(data.features) ? data.features : []);
      } catch (fetchError) {
        if (!active || controller.signal.aborted) return;
        console.error("District map load failed:", fetchError);
        setError("Couldn't load the district map right now.");
        setFeatures([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMap();

    return () => {
      active = false;
      controller.abort();
    };
  }, [stateAbbr]);

  const mapHeight = useMemo(() => {
    if (stateAbbr) return Math.min(360, Math.max(260, screenWidth * 0.68));
    return Math.min(440, Math.max(300, screenWidth * 0.78));
  }, [screenWidth, stateAbbr]);

  const projection = useMemo(() => {
    if (!features.length) return null;
    const collection: DistrictCollection = {
      type: "FeatureCollection",
      features,
    };
    // TIGER GeoJSON rings are best treated as planar coordinates here.
    // Using geoIdentity avoids spherical winding/complement artifacts.
    return geoIdentity().reflectY(true).fitSize([mapWidth, mapHeight], collection as any);
  }, [features, mapHeight, mapWidth]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return geoPath(projection);
  }, [projection]);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}>
          Tap a congressional district
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#7B7C81",
            lineHeight: 18,
            marginTop: 4,
          }}
        >
          {stateAbbr
            ? "This view is focused on your selected state so the districts are easier to hit."
            : "Zoomed out to the continental U.S. map. Use the state filter to make districts easier to tap."}
        </Text>
      </View>

      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: "#F7F4EF",
          minHeight: mapHeight,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <View style={{ alignItems: "center", gap: 12, paddingVertical: 40 }}>
            <ActivityIndicator color="#008CFF" />
            <Text style={{ fontSize: 13, color: "#7B7C81" }}>
              Loading district boundaries...
            </Text>
          </View>
        ) : error ? (
          <View style={{ alignItems: "center", padding: 24 }}>
            <Text
              style={{ fontSize: 14, color: "#D45252", textAlign: "center" }}
            >
              {error}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7B7C81",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              You can still use ZIP lookup below.
            </Text>
          </View>
        ) : !features.length || !pathGenerator ? (
          <View style={{ alignItems: "center", padding: 24 }}>
            <Text
              style={{ fontSize: 14, color: "#7B7C81", textAlign: "center" }}
            >
              No district geometry was returned.
            </Text>
          </View>
        ) : (
          <Svg
            width={mapWidth}
            height={mapHeight}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          >
            {features.map((feature) => {
              const districtNumber = parseInt(feature.properties.BASENAME, 10);
              const selected = selectedGEOID === feature.properties.GEOID;
              const d = pathGenerator(feature as any) ?? "";

              return (
                <Path
                  key={feature.properties.GEOID}
                  d={d}
                  fill={selected ? "#008CFF" : "#E8F4FF"}
                  fillOpacity={selected ? 0.95 : 0.9}
                  stroke={selected ? "#005EA8" : "#B7CBE0"}
                  strokeWidth={selected ? 1.8 : 0.8}
                  onPress={() => {
                    setSelectedGEOID(feature.properties.GEOID);
                    onSelectDistrict({
                      geoid: feature.properties.GEOID,
                      stateAbbr: feature.properties.STATE,
                      district: districtNumber,
                      label: feature.properties.NAME,
                    });
                  }}
                />
              );
            })}
          </Svg>
        )}
      </View>

      {selectedGEOID && (
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#E8F4FF",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 13, color: "#005EA8", fontWeight: "600" }}>
            District selected
          </Text>
          <Pressable onPress={() => setSelectedGEOID(null)}>
            <Text style={{ fontSize: 13, color: "#005EA8", fontWeight: "600" }}>
              Clear
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
