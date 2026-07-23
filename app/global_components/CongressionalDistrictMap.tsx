import { geoIdentity, geoPath } from "d3-geo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
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

type FocusDistrict = {
  stateAbbr: string;
  district: number;
};

type Props = {
  stateAbbr?: string | null;
  onSelectDistrict: (district: DistrictSelection) => void;
  focusDistricts?: FocusDistrict[] | null;
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

const FIPS_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBR_TO_FIPS).map(([abbr, fips]) => [fips, abbr]),
);

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

function computeBBox(
  features: DistrictFeature[],
  projection: ReturnType<typeof geoIdentity> | null,
): { x: number; y: number; w: number; h: number } | null {
  if (!projection || !features.length) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const feature of features) {
    const coords =
      feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates
        : feature.geometry.coordinates.flat();

    for (const ring of coords) {
      for (const [lon, lat] of ring) {
        const projected = projection([lon, lat]);
        if (!projected) continue;
        const [px, py] = projected;
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }
    }
  }

  if (minX === Infinity) return null;

  const pad = 40;
  return {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
  };
}

export default function CongressionalDistrictMap({
  stateAbbr,
  onSelectDistrict,
  focusDistricts,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const mapWidth = Math.max(240, screenWidth - 64);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DistrictFeature[]>([]);
  const [selectedGEOID, setSelectedGEOID] = useState<string | null>(null);
  const [highlightGeoids, setHighlightGeoids] = useState<Set<string>>(
    new Set(),
  );

  const initialViewBox = useMemo(
    () => ({ x: 0, y: 0, w: mapWidth, h: 0 }),
    [mapWidth],
  );
  const [viewBox, setViewBox] = useState(initialViewBox);
  const [isZoomed, setIsZoomed] = useState(false);
  const savedViewBox = useRef(initialViewBox);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadMap = async () => {
      setLoading(true);
      setError(null);
      setSelectedGEOID(null);
      setHighlightGeoids(new Set());

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
    return geoIdentity()
      .reflectY(true)
      .fitSize([mapWidth, mapHeight], collection as any);
  }, [features, mapHeight, mapWidth]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return geoPath(projection);
  }, [projection]);

  const viewBoxStr = useMemo(() => {
    const h = viewBox.h || mapHeight;
    return `${viewBox.x} ${viewBox.y} ${viewBox.w} ${h}`;
  }, [viewBox, mapHeight]);

  const handleZoomIn = useCallback(() => {
    setViewBox((prev) => {
      const h = prev.h || mapHeight;
      const factor = 0.7;
      const newW = Math.max(prev.w * factor, mapWidth * 0.15);
      const newH = Math.max(h * factor, mapHeight * 0.15);
      return {
        x: prev.x + (prev.w - newW) / 2,
        y: prev.y + (h - newH) / 2,
        w: newW,
        h: newH,
      };
    });
    setIsZoomed(true);
  }, [mapWidth, mapHeight]);

  const handleZoomOut = useCallback(() => {
    setViewBox((prev) => {
      const h = prev.h || mapHeight;
      const factor = 1.4;
      return {
        x: prev.x + (prev.w - prev.w * factor) / 2,
        y: prev.y + (h - h * factor) / 2,
        w: prev.w * factor,
        h: h * factor,
      };
    });
    setIsZoomed(true);
  }, [mapHeight]);

  const handleResetZoom = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: mapWidth, h: mapHeight });
    setIsZoomed(false);
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    setViewBox({ x: 0, y: 0, w: mapWidth, h: mapHeight });
    setIsZoomed(false);
    savedViewBox.current = { x: 0, y: 0, w: mapWidth, h: mapHeight };
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    if (!focusDistricts?.length || !features.length || !projection) return;

    const matched = features.filter((f) => {
      const fips = f.properties.STATE;
      const abbr = FIPS_TO_ABBR[fips];
      const distNum = parseInt(f.properties.BASENAME, 10);
      return focusDistricts.some(
        (fd) => fd.stateAbbr === abbr && fd.district === distNum,
      );
    });

    if (!matched.length) return;

    const geoids = new Set(matched.map((f) => f.properties.GEOID));
    setHighlightGeoids(geoids);

    const bbox = computeBBox(matched, projection);
    if (bbox) {
      savedViewBox.current = { x: 0, y: 0, w: mapWidth, h: mapHeight };
      setViewBox(bbox);
      setIsZoomed(true);
    }

    const first = matched[0];
    const firstFips = first.properties.STATE;
    const firstAbbr = FIPS_TO_ABBR[firstFips];
    const firstDist = parseInt(first.properties.BASENAME, 10);
    setSelectedGEOID(first.properties.GEOID);
    onSelectDistrict({
      geoid: first.properties.GEOID,
      stateAbbr: firstAbbr,
      district: firstDist,
      label: first.properties.NAME,
    });
  }, [focusDistricts, features, projection, mapWidth, mapHeight]);

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
          <View>
            <Svg
              width={mapWidth}
              height={mapHeight}
              viewBox={viewBoxStr}
            >
              {features.map((feature) => {
                const districtNumber = parseInt(
                  feature.properties.BASENAME,
                  10,
                );
                const selected = selectedGEOID === feature.properties.GEOID;
                const highlighted = highlightGeoids.has(
                  feature.properties.GEOID,
                );
                const d = pathGenerator(feature as any) ?? "";

                const isFocused = selected || highlighted;

                return (
                  <Path
                    key={feature.properties.GEOID}
                    d={d}
                    fill={isFocused ? "#008CFF" : "#E8F4FF"}
                    fillOpacity={isFocused ? 0.95 : 0.9}
                    stroke={isFocused ? "#005EA8" : "#B7CBE0"}
                    strokeWidth={isFocused ? 1.8 : 0.8}
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

            <View
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                flexDirection: "column",
                gap: 6,
              }}
            >
              <Pressable
                onPress={handleZoomIn}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: 22,
                  }}
                >
                  +
                </Text>
              </Pressable>

              <Pressable
                onPress={handleZoomOut}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#fff",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    lineHeight: 22,
                  }}
                >
                  −
                </Text>
              </Pressable>

              {isZoomed && (
                <Pressable
                  onPress={handleResetZoom}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#008CFF",
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 3,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    ↺
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
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
          <Pressable
            onPress={() => {
              setSelectedGEOID(null);
              setHighlightGeoids(new Set());
            }}
          >
            <Text style={{ fontSize: 13, color: "#005EA8", fontWeight: "600" }}>
              Clear
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
