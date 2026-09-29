import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

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

const CONTIGUOUS_STATE_EXCLUSIONS =
  "STATE NOT IN ('02','15','60','66','69','72','78')";

function buildQueryUrl(stateAbbr?: string | null): string {
  const params = new URLSearchParams();
  const stateFips = stateAbbr ? STATE_ABBR_TO_FIPS[stateAbbr] : null;
  params.set(
    "where",
    stateFips ? `STATE='${stateFips}'` : CONTIGUOUS_STATE_EXCLUSIONS,
  );
  params.set("outFields", "GEOID,STATE,BASENAME,NAME");
  params.set("returnGeometry", "true");
  params.set("f", "geojson");
  params.set("outSR", "4326");
  params.set("geometryPrecision", "3");
  params.set("maxAllowableOffset", stateFips ? "0.005" : "0.02");
  return `${BASE_URL}?${params.toString()}`;
}

function escapeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildOpenStreetMapHtml(params: {
  features: DistrictFeature[];
  alaskaFeatures: DistrictFeature[];
  hawaiiFeatures: DistrictFeature[];
  highlightGeoids: string[];
  initialSelectedGEOID: string | null;
  initialMapRegion: "us" | "ak" | "hi";
}): string {
  const payload = escapeJsonForHtml(params);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html,
      body,
      #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: #f7f4ef;
      }

      body {
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .leaflet-container {
        background: #f7f4ef;
      }

      .leaflet-control-zoom {
        border: none;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        overflow: hidden;
      }

      .leaflet-control-zoom a {
        background: #ffffff;
        color: #1a1a1a;
        border-bottom: 1px solid #edf1f5;
      }

      .leaflet-control-zoom a:hover {
        background: #f4f9ff;
      }

      .map-toolbar {
        position: absolute;
        right: 12px;
        top: 12px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .map-button {
        width: 38px;
        height: 38px;
        border-radius: 19px;
        border: none;
        background: #ffffff;
        color: #1a1a1a;
        font-size: 20px;
        font-weight: 700;
        line-height: 38px;
        text-align: center;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
      }

      .map-button:active {
        transform: scale(0.97);
      }

      .attribution-note {
        position: absolute;
        left: 10px;
        bottom: 10px;
        z-index: 1000;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.9);
        color: #4e5560;
        font-size: 11px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
        pointer-events: none;
      }

      .map-state-switch {
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .state-button {
        min-width: 90px;
        border: none;
        border-radius: 999px;
        padding: 7px 12px;
        background: rgba(255, 255, 255, 0.95);
        color: #1a1a1a;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.01em;
        text-align: left;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
      }

      .state-button.active {
        background: #008cff;
        color: #ffffff;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="map-state-switch">
      <button id="state-us" class="state-button" type="button">Lower 48</button>
      <button id="state-ak" class="state-button" type="button">Alaska</button>
      <button id="state-hi" class="state-button" type="button">Hawaii</button>
    </div>
    <div class="map-toolbar">
      <button id="zoom-in" class="map-button" type="button">+</button>
      <button id="zoom-out" class="map-button" type="button">−</button>
      <button id="reset-view" class="map-button" type="button">↺</button>
    </div>
    <div class="attribution-note">Map tiles © OpenStreetMap contributors</div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        const payload = ${payload};
        const features = Array.isArray(payload.features) ? payload.features : [];
        const alaskaFeatures = Array.isArray(payload.alaskaFeatures) ? payload.alaskaFeatures : [];
        const hawaiiFeatures = Array.isArray(payload.hawaiiFeatures) ? payload.hawaiiFeatures : [];
        const highlightGeoids = new Set(
          Array.isArray(payload.highlightGeoids) ? payload.highlightGeoids : [],
        );
        const initialSelectedGEOID = payload.initialSelectedGEOID || null;
        const initialMapRegion = payload.initialMapRegion || "us";

        const map = L.map("map", {
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        let selectedGEOID = initialSelectedGEOID;

        function styleForFeature(feature) {
          const properties = feature && feature.properties ? feature.properties : {};
          const geoid = properties.GEOID || null;
          const isSelected = selectedGEOID && selectedGEOID === geoid;
          const isHighlighted = highlightGeoids.has(geoid);

          if (isSelected) {
            return {
              color: "#003d6b",
              weight: 2.2,
              opacity: 1,
              fillColor: "#008cff",
              fillOpacity: 0.52,
            };
          }

          if (isHighlighted) {
            return {
              color: "#005ea8",
              weight: 1.6,
              opacity: 1,
              fillColor: "#008cff",
              fillOpacity: 0.34,
            };
          }

          return {
            color: "#b7cbe0",
            weight: 1,
            opacity: 1,
            fillColor: "#e8f4ff",
            fillOpacity: 0.22,
          };
        }

        function emitSelection(feature) {
          const properties = feature && feature.properties ? feature.properties : {};
          const districtNumber = Number.parseInt(properties.BASENAME || "", 10);
          const stateAbbr = properties.STATE ? ${JSON.stringify(FIPS_TO_ABBR)}[properties.STATE] : null;

          if (!window.ReactNativeWebView || !properties.GEOID || !stateAbbr) {
            return;
          }

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "select",
              district: {
                geoid: properties.GEOID,
                stateAbbr: stateAbbr,
                district: Number.isFinite(districtNumber) ? districtNumber : 0,
                label: properties.NAME,
              },
            }),
          );
        }

        function createDistrictLayer(layerFeatures) {
          return L.geoJSON(layerFeatures, {
            style: styleForFeature,
            onEachFeature: function (feature, layer) {
              layer.on("click", function () {
                const properties = feature && feature.properties ? feature.properties : {};
                if (!properties.GEOID) return;

                selectedGEOID = properties.GEOID;
                refreshAllStyles();
                emitSelection(feature);
              });
            },
          });
        }

        const layerMap = {
          us: createDistrictLayer(features),
          ak: createDistrictLayer(alaskaFeatures),
          hi: createDistrictLayer(hawaiiFeatures),
        };

        let activeRegion = "us";
        let activeLayer = null;

        function refreshAllStyles() {
          Object.values(layerMap).forEach(function (layer) {
            if (layer && typeof layer.setStyle === "function") {
              layer.setStyle(styleForFeature);
            }
          });
        }

        function setActiveButton(region) {
          ["us", "ak", "hi"].forEach(function (key) {
            const button = document.getElementById("state-" + key);
            if (!button) return;
            button.classList.toggle("active", key === region);
          });
        }

        function getLayerBounds(layer) {
          if (!layer || typeof layer.getBounds !== "function") return null;
          const bounds = layer.getBounds();
          return bounds && bounds.isValid() ? bounds : null;
        }

        function getHighlightBoundsForLayer(layer) {
          const focusLayers = [];

          layer.eachLayer(function (childLayer) {
            const feature = childLayer && childLayer.feature ? childLayer.feature : null;
            const properties = feature && feature.properties ? feature.properties : {};
            if (properties.GEOID && highlightGeoids.has(properties.GEOID)) {
              focusLayers.push(childLayer);
            }
          });

          if (!focusLayers.length) return null;
          const bounds = L.featureGroup(focusLayers).getBounds();
          return bounds && bounds.isValid() ? bounds : null;
        }

        function resolveRegion(region) {
          const targetLayer = layerMap[region];
          const targetBounds = getLayerBounds(targetLayer);
          if (targetLayer && targetBounds) return region;
          return "us";
        }

        function activateRegion(region, options) {
          const nextRegion = resolveRegion(region);
          const opts = options || {};

          if (activeLayer && map.hasLayer(activeLayer)) {
            map.removeLayer(activeLayer);
          }

          activeLayer = layerMap[nextRegion];
          activeRegion = nextRegion;

          if (activeLayer) {
            activeLayer.addTo(map);
          }

          refreshAllStyles();
          setActiveButton(nextRegion);

          if (opts.skipFit) return;

          const highlightBounds = activeLayer
            ? getHighlightBoundsForLayer(activeLayer)
            : null;
          const targetBounds = highlightBounds || getLayerBounds(activeLayer);
          if (targetBounds) {
            map.fitBounds(targetBounds.pad(highlightBounds ? 0.16 : 0.1));
          } else {
            map.setView([39.5, -98.35], 4);
          }
        }

        function detectRegionFromGeoid(geoid) {
          if (!geoid || geoid.length < 2) return null;
          const stateFips = geoid.slice(0, 2);
          if (stateFips === "02") return "ak";
          if (stateFips === "15") return "hi";
          return "us";
        }

        function getFocusBounds() {
          if (activeLayer) {
            const highlightBounds = getHighlightBoundsForLayer(activeLayer);
            if (highlightBounds) return highlightBounds;
            return getLayerBounds(activeLayer);
          }
          return null;
        }

        function fitInitialView() {
          const bounds = getFocusBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds.pad(highlightGeoids.size ? 0.14 : 0.08));
          } else {
            map.setView([39.5, -98.35], 4);
          }
        }

        document.getElementById("state-us").addEventListener("click", function () {
          activateRegion("us");
        });

        document.getElementById("state-ak").addEventListener("click", function () {
          activateRegion("ak");
        });

        document.getElementById("state-hi").addEventListener("click", function () {
          activateRegion("hi");
        });

        document.getElementById("zoom-in").addEventListener("click", function () {
          map.zoomIn();
        });

        document.getElementById("zoom-out").addEventListener("click", function () {
          map.zoomOut();
        });

        document.getElementById("reset-view").addEventListener("click", function () {
          fitInitialView();
        });

        const highlightRegion = (() => {
          const firstHighlighted = Array.from(highlightGeoids)[0] || null;
          return detectRegionFromGeoid(firstHighlighted);
        })();

        const selectedRegion = detectRegionFromGeoid(initialSelectedGEOID);
        const startRegion = highlightRegion || selectedRegion || initialMapRegion || "us";
        activateRegion(startRegion);

        if (selectedGEOID) {
          refreshAllStyles();
        }
      })();
    </script>
  </body>
</html>`;
}

function matchesFocusDistrict(
  feature: DistrictFeature,
  focusDistricts: FocusDistrict[] | null | undefined,
): boolean {
  if (!focusDistricts?.length) return false;

  const fips = feature.properties.STATE;
  const abbr = FIPS_TO_ABBR[fips];
  const districtNumber = Number.parseInt(feature.properties.BASENAME, 10);

  return focusDistricts.some(
    (district) =>
      district.stateAbbr === abbr && district.district === districtNumber,
  );
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
  const [alaskaFeatures, setAlaskaFeatures] = useState<DistrictFeature[]>([]);
  const [hawaiiFeatures, setHawaiiFeatures] = useState<DistrictFeature[]>([]);
  const autoSelectRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadMap = async () => {
      setLoading(true);
      setError(null);

      try {
        const [contiguousResponse, alaskaResponse, hawaiiResponse] =
          await Promise.all([
            fetch(buildQueryUrl(stateAbbr), { signal: controller.signal }),
            fetch(buildQueryUrl("AK"), { signal: controller.signal }),
            fetch(buildQueryUrl("HI"), { signal: controller.signal }),
          ]);

        if (
          !contiguousResponse.ok ||
          !alaskaResponse.ok ||
          !hawaiiResponse.ok
        ) {
          throw new Error("Failed to load map data");
        }

        const [data, alaskaData, hawaiiData] = (await Promise.all([
          contiguousResponse.json(),
          alaskaResponse.json(),
          hawaiiResponse.json(),
        ])) as [DistrictCollection, DistrictCollection, DistrictCollection];
        if (!active) return;
        setFeatures(Array.isArray(data.features) ? data.features : []);
        setAlaskaFeatures(
          Array.isArray(alaskaData.features) ? alaskaData.features : [],
        );
        setHawaiiFeatures(
          Array.isArray(hawaiiData.features) ? hawaiiData.features : [],
        );
      } catch (fetchError) {
        if (!active || controller.signal.aborted) return;
        console.error("District map load failed:", fetchError);
        setError("Couldn't load the district map right now.");
        setFeatures([]);
        setAlaskaFeatures([]);
        setHawaiiFeatures([]);
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

  const allFeatures = useMemo(
    () => [...features, ...alaskaFeatures, ...hawaiiFeatures],
    [features, alaskaFeatures, hawaiiFeatures],
  );

  const matchedFocusDistricts = useMemo(() => {
    if (!focusDistricts?.length || !allFeatures.length) return [];
    return allFeatures.filter((feature) =>
      matchesFocusDistrict(feature, focusDistricts),
    );
  }, [allFeatures, focusDistricts]);

  const highlightGeoids = useMemo(
    () => matchedFocusDistricts.map((feature) => feature.properties.GEOID),
    [matchedFocusDistricts],
  );

  const initialSelectedGEOID =
    matchedFocusDistricts[0]?.properties.GEOID ?? null;

  useEffect(() => {
    if (!matchedFocusDistricts.length) {
      autoSelectRef.current = null;
      return;
    }

    const first = matchedFocusDistricts[0];
    const autoSelectKey = `${first.properties.GEOID}:${matchedFocusDistricts.length}`;
    if (autoSelectRef.current === autoSelectKey) {
      return;
    }

    autoSelectRef.current = autoSelectKey;
    const firstAbbr = FIPS_TO_ABBR[first.properties.STATE];
    const firstDistrict = Number.parseInt(first.properties.BASENAME, 10);

    onSelectDistrict({
      geoid: first.properties.GEOID,
      stateAbbr: firstAbbr,
      district: Number.isFinite(firstDistrict) ? firstDistrict : 0,
      label: first.properties.NAME,
    });
  }, [matchedFocusDistricts, onSelectDistrict]);

  const webViewSource = useMemo(
    () =>
      buildOpenStreetMapHtml({
        features,
        alaskaFeatures,
        hawaiiFeatures,
        highlightGeoids,
        initialSelectedGEOID,
        initialMapRegion:
          stateAbbr === "AK" ? "ak" : stateAbbr === "HI" ? "hi" : "us",
      }),
    [
      features,
      alaskaFeatures,
      hawaiiFeatures,
      highlightGeoids,
      initialSelectedGEOID,
      stateAbbr,
    ],
  );

  const webViewKey = useMemo(
    () =>
      `${stateAbbr ?? "all"}-${features.length}-${alaskaFeatures.length}-${hawaiiFeatures.length}-${highlightGeoids.join(",")}-${initialSelectedGEOID ?? "none"}`,
    [
      stateAbbr,
      features.length,
      alaskaFeatures.length,
      hawaiiFeatures.length,
      highlightGeoids,
      initialSelectedGEOID,
    ],
  );

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        district?: DistrictSelection;
      };

      if (message.type !== "select" || !message.district) return;
      onSelectDistrict(message.district);
    } catch (error) {
      console.warn("Ignored district map message:", error);
    }
  };

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
        ) : !features.length ? (
          <View style={{ alignItems: "center", padding: 24 }}>
            <Text
              style={{ fontSize: 14, color: "#7B7C81", textAlign: "center" }}
            >
              No district geometry was returned.
            </Text>
          </View>
        ) : (
          <WebView
            key={webViewKey}
            source={{ html: webViewSource }}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            onMessage={handleWebViewMessage}
            style={{
              width: mapWidth,
              height: mapHeight,
              backgroundColor: "#F7F4EF",
            }}
          />
        )}
      </View>
    </View>
  );
}
