import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import {
    WebView,
    type WebViewMessageEvent,
    type WebViewNavigation,
} from "react-native-webview";

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

export type DistrictSelection = {
  geoid: string;
  stateAbbr: string;
  district: number;
  label: string;
};

export type FocusDistrict = {
  stateAbbr: string;
  district: number;
};

export type PinLocation = {
  latitude: number;
  longitude: number;
};

type Props = {
  // Limits the map to one state; the lower 48 are shown when omitted
  stateAbbr?: string | null;
  onSelectDistrict: (district: DistrictSelection) => void;
  focusDistricts?: FocusDistrict[] | null;
  // Auto-select the first focus district once boundaries load. Off when the
  // user should choose between several highlighted districts themselves.
  autoSelectFocus?: boolean;
  // Externally chosen district (e.g. from an address lookup)
  selectedGeoid?: string | null;
  // Marker for a geocoded address
  pinLocation?: PinLocation | null;
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

// Layer 54 of the ACS2025 service is the 119th Congress districts, which
// current members represent. tigerWMS_Current already serves the 120th
// Congress districts (seated January 2027) — switch to it when the 120th
// Congress begins. Keep in sync with CENSUS_VINTAGE in censusGeocoding.ts.
const DISTRICT_LAYER_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/54/query";

// Map tile requests carry this as their Referer, which the OpenStreetMap
// tile usage policy requires.
const WEBVIEW_BASE_URL = "https://www.unuminitiative.com/";

const CONTIGUOUS_STATE_EXCLUSIONS =
  "STATE NOT IN ('02','15','60','66','69','72','78')";

function buildQueryUrl(stateAbbr?: string | null): string {
  const stateFips = stateAbbr ? STATE_ABBR_TO_FIPS[stateAbbr] : null;
  const params: Record<string, string> = {
    where: stateFips ? `STATE='${stateFips}'` : CONTIGUOUS_STATE_EXCLUSIONS,
    outFields: "GEOID,STATE,BASENAME,NAME",
    returnGeometry: "true",
    f: "geojson",
    outSR: "4326",
    geometryPrecision: "3",
    maxAllowableOffset: stateFips ? "0.005" : "0.02",
  };
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${DISTRICT_LAYER_URL}?${query}`;
}

// Drops "Congressional Districts not defined" areas (GEOID ending in ZZ),
// which are large water bodies with no representative.
function definedDistricts(collection: DistrictCollection): DistrictFeature[] {
  if (!Array.isArray(collection.features)) return [];
  return collection.features.filter(
    (feature) => !feature.properties.GEOID?.endsWith("ZZ"),
  );
}

function escapeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildOpenStreetMapHtml(params: {
  features: DistrictFeature[];
  highlightGeoids: string[];
  initialSelectedGEOID: string | null;
  pinLocation: PinLocation | null;
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

      .leaflet-control-attribution {
        font-size: 11px;
        background: rgba(255, 255, 255, 0.9) !important;
        border-top-left-radius: 8px;
        padding: 2px 8px !important;
      }

      .leaflet-control-attribution a {
        color: #005ea8;
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
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="map-toolbar">
      <button id="zoom-in" class="map-button" type="button">+</button>
      <button id="zoom-out" class="map-button" type="button">−</button>
      <button id="reset-view" class="map-button" type="button">↺</button>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        const payload = ${payload};
        const features = Array.isArray(payload.features) ? payload.features : [];
        const highlightGeoids = new Set(
          Array.isArray(payload.highlightGeoids) ? payload.highlightGeoids : [],
        );
        const pinLocation = payload.pinLocation || null;
        let selectedGEOID = payload.initialSelectedGEOID || null;

        const map = L.map("map", {
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true,
        });

        map.attributionControl.setPrefix(
          '<a href="https://leafletjs.com">Leaflet</a>',
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Districts: <a href="https://www.census.gov/geographies/mapping-files.html">U.S. Census Bureau</a>',
        }).addTo(map);

        function styleForFeature(feature) {
          const properties = feature && feature.properties ? feature.properties : {};
          const geoid = properties.GEOID || null;

          if (selectedGEOID && selectedGEOID === geoid) {
            return {
              color: "#003d6b",
              weight: 2.2,
              opacity: 1,
              fillColor: "#008cff",
              fillOpacity: 0.52,
            };
          }

          if (highlightGeoids.has(geoid)) {
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

        const districtLayer = L.geoJSON(features, {
          style: styleForFeature,
          onEachFeature: function (feature, layer) {
            layer.on("click", function () {
              const properties = feature && feature.properties ? feature.properties : {};
              if (!properties.GEOID) return;

              selectedGEOID = properties.GEOID;
              districtLayer.setStyle(styleForFeature);
              emitSelection(feature);
            });
          },
        }).addTo(map);

        function getHighlightBounds() {
          const focusLayers = [];
          districtLayer.eachLayer(function (childLayer) {
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

        function fitInitialView() {
          const highlightBounds = getHighlightBounds();
          const layerBounds = districtLayer.getBounds();
          if (highlightBounds) {
            map.fitBounds(highlightBounds.pad(0.16));
          } else if (layerBounds && layerBounds.isValid()) {
            map.fitBounds(layerBounds.pad(0.08));
          } else {
            map.setView([39.5, -98.35], 4);
          }
        }

        document.getElementById("zoom-in").addEventListener("click", function () {
          map.zoomIn();
        });

        document.getElementById("zoom-out").addEventListener("click", function () {
          map.zoomOut();
        });

        document.getElementById("reset-view").addEventListener("click", function () {
          fitInitialView();
        });

        fitInitialView();

        if (pinLocation) {
          L.circleMarker([pinLocation.latitude, pinLocation.longitude], {
            radius: 7,
            color: "#ffffff",
            weight: 3,
            fillColor: "#d45252",
            fillOpacity: 1,
            interactive: false,
          }).addTo(map);
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
      district.stateAbbr === abbr &&
      district.district ===
        (Number.isFinite(districtNumber) ? districtNumber : 0),
  );
}

// Full-width, edge-to-edge district map. Place it outside any horizontal
// padding so it spans the screen.
export default function CongressionalDistrictMap({
  stateAbbr,
  onSelectDistrict,
  focusDistricts,
  autoSelectFocus = true,
  selectedGeoid,
  pinLocation,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DistrictFeature[]>([]);
  const autoSelectRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadMap = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(buildQueryUrl(stateAbbr), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load map data");
        }

        const data = (await response.json()) as DistrictCollection;
        if (!active) return;
        setFeatures(definedDistricts(data));
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
    if (stateAbbr) return Math.min(720, Math.max(520, screenWidth * 1.36));
    return Math.min(880, Math.max(600, screenWidth * 1.56));
  }, [screenWidth, stateAbbr]);

  const matchedFocusDistricts = useMemo(() => {
    if (!focusDistricts?.length || !features.length) return [];
    return features.filter((feature) =>
      matchesFocusDistrict(feature, focusDistricts),
    );
  }, [features, focusDistricts]);

  const highlightGeoids = useMemo(
    () => matchedFocusDistricts.map((feature) => feature.properties.GEOID),
    [matchedFocusDistricts],
  );

  const initialSelectedGEOID =
    selectedGeoid ??
    (autoSelectFocus
      ? (matchedFocusDistricts[0]?.properties.GEOID ?? null)
      : null);

  useEffect(() => {
    if (!autoSelectFocus || selectedGeoid || !matchedFocusDistricts.length) {
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
  }, [matchedFocusDistricts, onSelectDistrict, autoSelectFocus, selectedGeoid]);

  const webViewSource = useMemo(
    () => ({
      html: buildOpenStreetMapHtml({
        features,
        highlightGeoids,
        initialSelectedGEOID,
        pinLocation: pinLocation ?? null,
      }),
      baseUrl: WEBVIEW_BASE_URL,
    }),
    [features, highlightGeoids, initialSelectedGEOID, pinLocation],
  );

  const webViewKey = useMemo(
    () =>
      `${stateAbbr ?? "all"}-${features.length}-${highlightGeoids.join(",")}-${initialSelectedGEOID ?? "none"}-${pinLocation ? `${pinLocation.latitude},${pinLocation.longitude}` : "nopin"}`,
    [stateAbbr, features.length, highlightGeoids, initialSelectedGEOID, pinLocation],
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

  // Attribution links open in the system browser instead of inside the map
  const handleShouldStartLoad = (request: WebViewNavigation) => {
    const { url } = request;
    if (url === WEBVIEW_BASE_URL || url === "about:blank") return true;
    if (/^https?:\/\//.test(url)) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    return true;
  };

  return (
    <View
      style={{
        width: screenWidth,
        height: mapHeight,
        backgroundColor: "#F7F4EF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <View style={{ alignItems: "center", gap: 12 }}>
          <ActivityIndicator color="#008CFF" />
          <Text style={{ fontSize: 13, color: "#7B7C81" }}>
            Loading district boundaries...
          </Text>
        </View>
      ) : error ? (
        <View style={{ alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 14, color: "#D45252", textAlign: "center" }}>
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
            Please check your connection and try again.
          </Text>
        </View>
      ) : !features.length ? (
        <Text style={{ fontSize: 14, color: "#7B7C81", textAlign: "center" }}>
          No district geometry was returned.
        </Text>
      ) : (
        <WebView
          key={webViewKey}
          source={webViewSource}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          nestedScrollEnabled
          applicationNameForUserAgent="Unum"
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          setSupportMultipleWindows={false}
          style={{
            width: screenWidth,
            height: mapHeight,
            backgroundColor: "#F7F4EF",
          }}
        />
      )}
    </View>
  );
}
