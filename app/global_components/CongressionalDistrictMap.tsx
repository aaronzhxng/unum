<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
=======
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
>>>>>>> origin/master

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

<<<<<<< HEAD
type DistrictSelection = {
=======
export type DistrictSelection = {
>>>>>>> origin/master
  geoid: string;
  stateAbbr: string;
  district: number;
  label: string;
};

<<<<<<< HEAD
type FocusDistrict = {
=======
export type FocusDistrict = {
>>>>>>> origin/master
  stateAbbr: string;
  district: number;
};

<<<<<<< HEAD
type Props = {
  stateAbbr?: string | null;
  onSelectDistrict: (district: DistrictSelection) => void;
  focusDistricts?: FocusDistrict[] | null;
=======
export type PinLocation = {
  latitude: number;
  longitude: number;
};

type Props = {
  // Limits the map to one state; the lower 48 are shown when omitted
  stateAbbr?: string | null;
  onSelectDistrict?: (district: DistrictSelection) => void;
  focusDistricts?: FocusDistrict[] | null;
  // Auto-select the first focus district once boundaries load. Off when the
  // user should choose between several highlighted districts themselves.
  autoSelectFocus?: boolean;
  // Externally chosen district (e.g. from an address lookup)
  selectedGeoid?: string | null;
  // Marker for a geocoded address
  pinLocation?: PinLocation | null;
  // With a state selected, also load every other state's districts in the
  // background so the user can pan anywhere and tap them. The selected state
  // still loads first, so it's interactive right away.
  loadOtherStates?: boolean;
  // false locks the map in place as a static preview: no panning, zooming,
  // or tapping districts, and no zoom buttons
  interactive?: boolean;
  // Defaults to full screen width and a height sized for exploring
  width?: number;
  height?: number;
  // For maps inside a tab pager: pass whether the map's tab is showing.
  // Android can drop parts of a web view's drawing while it's offscreen, so
  // the map repaints itself each time it comes back into view.
  visible?: boolean;
>>>>>>> origin/master
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

<<<<<<< HEAD
const BASE_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/54/query";
=======
// Layer 54 of the ACS2025 service is the 119th Congress districts, which
// current members represent. tigerWMS_Current already serves the 120th
// Congress districts (seated January 2027) — switch to it when the 120th
// Congress begins. Keep in sync with CENSUS_VINTAGE in censusGeocoding.ts.
const DISTRICT_LAYER_URL =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2025/MapServer/54/query";

// Map tile requests carry this as their Referer, which the OpenStreetMap
// tile usage policy requires.
const WEBVIEW_BASE_URL = "https://www.unuminitiative.com/";
>>>>>>> origin/master

const CONTIGUOUS_STATE_EXCLUSIONS =
  "STATE NOT IN ('02','15','60','66','69','72','78')";

function buildQueryUrl(stateAbbr?: string | null): string {
<<<<<<< HEAD
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
=======
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

const ALASKA_FIPS = "02";

// The Aleutian Islands cross the 180th meridian, so part of Alaska comes back
// with eastern-hemisphere (positive) longitudes. Fitting the map to that spans
// the whole globe; shifting those points 360° west keeps Alaska in one piece.
function shiftWestOfAntimeridian(coordinates: any): any {
  if (typeof coordinates[0] === "number") {
    return coordinates[0] > 0
      ? [coordinates[0] - 360, ...coordinates.slice(1)]
      : coordinates;
  }
  return coordinates.map(shiftWestOfAntimeridian);
}

// Drops "Congressional Districts not defined" areas (GEOID ending in ZZ),
// which are large water bodies with no representative.
function definedDistricts(collection: DistrictCollection): DistrictFeature[] {
  if (!Array.isArray(collection.features)) return [];
  return collection.features
    .filter((feature) => !feature.properties.GEOID?.endsWith("ZZ"))
    .map((feature) =>
      feature.properties.STATE === ALASKA_FIPS
        ? {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: shiftWestOfAntimeridian(
                feature.geometry.coordinates,
              ),
            },
          }
        : feature,
    );
}

// Every state and territory at slightly coarser borders (~700 KB, a few
// seconds from the Census server). Fetched once per app session and shared
// across map instances, so reopening the map or switching states is instant.
let allDistrictsRequest: Promise<DistrictFeature[]> | null = null;

function loadAllDistricts(): Promise<DistrictFeature[]> {
  if (!allDistrictsRequest) {
    const params: Record<string, string> = {
      where: "1=1",
      outFields: "GEOID,STATE,BASENAME,NAME",
      returnGeometry: "true",
      f: "geojson",
      outSR: "4326",
      geometryPrecision: "3",
      maxAllowableOffset: "0.01",
    };
    const query = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    allDistrictsRequest = fetch(`${DISTRICT_LAYER_URL}?${query}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load national districts");
        return response.json() as Promise<DistrictCollection>;
      })
      .then(definedDistricts)
      .catch((error) => {
        // Let the next map open retry instead of caching the failure
        allDistrictsRequest = null;
        throw error;
      });
  }
  return allDistrictsRequest;
>>>>>>> origin/master
}

function escapeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildOpenStreetMapHtml(params: {
  features: DistrictFeature[];
<<<<<<< HEAD
  alaskaFeatures: DistrictFeature[];
  hawaiiFeatures: DistrictFeature[];
  highlightGeoids: string[];
  initialSelectedGEOID: string | null;
  initialMapRegion: "us" | "ak" | "hi";
=======
  highlightGeoids: string[];
  initialSelectedGEOID: string | null;
  pinLocation: PinLocation | null;
  interactive: boolean;
>>>>>>> origin/master
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

<<<<<<< HEAD
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
=======
      .leaflet-control-attribution {
        font-size: 11px;
        background: rgba(255, 255, 255, 0.9) !important;
        border-top-right-radius: 8px;
        padding: 2px 8px 2px 24px !important;
      }

      .leaflet-control-attribution a {
        color: #005ea8;
>>>>>>> origin/master
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
<<<<<<< HEAD

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
=======
>>>>>>> origin/master
    </style>
  </head>
  <body>
    <div id="map"></div>
<<<<<<< HEAD
    <div class="map-state-switch">
      <button id="state-us" class="state-button" type="button">Lower 48</button>
      <button id="state-ak" class="state-button" type="button">Alaska</button>
      <button id="state-hi" class="state-button" type="button">Hawaii</button>
    </div>
=======
>>>>>>> origin/master
    <div class="map-toolbar">
      <button id="zoom-in" class="map-button" type="button">+</button>
      <button id="zoom-out" class="map-button" type="button">−</button>
      <button id="reset-view" class="map-button" type="button">↺</button>
    </div>
<<<<<<< HEAD
    <div class="attribution-note">Map tiles © OpenStreetMap contributors</div>
=======
>>>>>>> origin/master

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        const payload = ${payload};
        const features = Array.isArray(payload.features) ? payload.features : [];
<<<<<<< HEAD
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
=======
        const highlightGeoids = new Set(
          Array.isArray(payload.highlightGeoids) ? payload.highlightGeoids : [],
        );
        const pinLocation = payload.pinLocation || null;
        let selectedGEOID = payload.initialSelectedGEOID || null;

        const interactive = payload.interactive !== false;

        const map = L.map("map", {
          zoomControl: false,
          attributionControl: false,
          preferCanvas: true,
          dragging: interactive,
          touchZoom: interactive,
          doubleClickZoom: interactive,
          scrollWheelZoom: interactive,
          boxZoom: interactive,
          keyboard: interactive,
        });

        if (!interactive) {
          document.querySelector(".map-toolbar").style.display = "none";
        }

        // Bottom-left keeps it clear of the page's scroll buttons
        L.control
          .attribution({
            position: "bottomleft",
            prefix: '<a href="https://leafletjs.com">Leaflet</a>',
          })
          .addTo(map);

        const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Districts: <a href="https://www.census.gov/geographies/mapping-files.html">U.S. Census Bureau</a>',
        }).addTo(map);
>>>>>>> origin/master

        function styleForFeature(feature) {
          const properties = feature && feature.properties ? feature.properties : {};
          const geoid = properties.GEOID || null;
<<<<<<< HEAD
          const isSelected = selectedGEOID && selectedGEOID === geoid;
          const isHighlighted = highlightGeoids.has(geoid);

          if (isSelected) {
=======

          if (selectedGEOID && selectedGEOID === geoid) {
>>>>>>> origin/master
            return {
              color: "#003d6b",
              weight: 2.2,
              opacity: 1,
              fillColor: "#008cff",
              fillOpacity: 0.52,
            };
          }

<<<<<<< HEAD
          if (isHighlighted) {
=======
          if (highlightGeoids.has(geoid)) {
>>>>>>> origin/master
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

<<<<<<< HEAD
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
=======
        // Districts outside the selected state, added once they finish
        // loading in the background
        let otherStatesLayer = null;

        function restyleDistricts() {
          districtLayer.setStyle(styleForFeature);
          if (otherStatesLayer) otherStatesLayer.setStyle(styleForFeature);
        }

        function bindDistrictClick(feature, layer) {
          if (!interactive) return;
          layer.on("click", function () {
            const properties = feature && feature.properties ? feature.properties : {};
            if (!properties.GEOID) return;

            selectedGEOID = properties.GEOID;
            restyleDistricts();
            emitSelection(feature);
          });
        }

        const districtLayer = L.geoJSON(features, {
          style: styleForFeature,
          onEachFeature: bindDistrictClick,
        }).addTo(map);

        // Called from React Native when the map comes back into view
        window.redrawMap = function () {
          map.invalidateSize();
          tiles.redraw();
          restyleDistricts();
        };

        // Called from React Native once the rest of the country has loaded.
        // Added into the open map rather than reloading it, so the user's
        // current pan and zoom are kept.
        window.addOtherStateDistricts = function (otherFeatures) {
          if (otherStatesLayer || !Array.isArray(otherFeatures)) return;
          otherStatesLayer = L.geoJSON(otherFeatures, {
            style: styleForFeature,
            onEachFeature: bindDistrictClick,
          }).addTo(map);
          // The selected state keeps its sharper borders on top
          districtLayer.bringToFront();
        };

        function getHighlightBounds() {
          const focusLayers = [];
          districtLayer.eachLayer(function (childLayer) {
>>>>>>> origin/master
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

<<<<<<< HEAD
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
=======
        function fitInitialView() {
          const highlightBounds = getHighlightBounds();
          const layerBounds = districtLayer.getBounds();
          if (highlightBounds) {
            map.fitBounds(highlightBounds.pad(0.16));
          } else if (layerBounds && layerBounds.isValid()) {
            map.fitBounds(layerBounds.pad(0.08));
>>>>>>> origin/master
          } else {
            map.setView([39.5, -98.35], 4);
          }
        }

<<<<<<< HEAD
        document.getElementById("state-us").addEventListener("click", function () {
          activateRegion("us");
        });

        document.getElementById("state-ak").addEventListener("click", function () {
          activateRegion("ak");
        });

        document.getElementById("state-hi").addEventListener("click", function () {
          activateRegion("hi");
        });

=======
>>>>>>> origin/master
        document.getElementById("zoom-in").addEventListener("click", function () {
          map.zoomIn();
        });

        document.getElementById("zoom-out").addEventListener("click", function () {
          map.zoomOut();
        });

        document.getElementById("reset-view").addEventListener("click", function () {
          fitInitialView();
        });

<<<<<<< HEAD
        const highlightRegion = (() => {
          const firstHighlighted = Array.from(highlightGeoids)[0] || null;
          return detectRegionFromGeoid(firstHighlighted);
        })();

        const selectedRegion = detectRegionFromGeoid(initialSelectedGEOID);
        const startRegion = highlightRegion || selectedRegion || initialMapRegion || "us";
        activateRegion(startRegion);

        if (selectedGEOID) {
          refreshAllStyles();
=======
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
>>>>>>> origin/master
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
<<<<<<< HEAD
      district.stateAbbr === abbr && district.district === districtNumber,
  );
}

=======
      district.stateAbbr === abbr &&
      district.district ===
        (Number.isFinite(districtNumber) ? districtNumber : 0),
  );
}

// Full-width, edge-to-edge district map. Place it outside any horizontal
// padding so it spans the screen.
>>>>>>> origin/master
export default function CongressionalDistrictMap({
  stateAbbr,
  onSelectDistrict,
  focusDistricts,
<<<<<<< HEAD
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const mapWidth = Math.max(240, screenWidth - 64);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DistrictFeature[]>([]);
  const [alaskaFeatures, setAlaskaFeatures] = useState<DistrictFeature[]>([]);
  const [hawaiiFeatures, setHawaiiFeatures] = useState<DistrictFeature[]>([]);
  const autoSelectRef = useRef<string | null>(null);
=======
  autoSelectFocus = true,
  selectedGeoid,
  pinLocation,
  loadOtherStates = false,
  interactive = true,
  width,
  height,
  visible = true,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const mapWidth = width ?? screenWidth;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<DistrictFeature[]>([]);
  const [allDistricts, setAllDistricts] = useState<DistrictFeature[] | null>(
    null,
  );
  const autoSelectRef = useRef<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const webViewLoaded = useRef(false);

  useEffect(() => {
    if (!loadOtherStates || !stateAbbr) return;
    let active = true;
    loadAllDistricts()
      .then((districts) => {
        if (active) setAllDistricts(districts);
      })
      .catch((loadError) => {
        // The selected state still works; other states just stay untappable
        console.warn("Background district load failed:", loadError);
      });
    return () => {
      active = false;
    };
  }, [loadOtherStates, stateAbbr]);

  const otherStateDistricts = useMemo(() => {
    if (!loadOtherStates || !stateAbbr || !allDistricts) return null;
    const stateFips = STATE_ABBR_TO_FIPS[stateAbbr];
    return allDistricts.filter(
      (feature) => feature.properties.STATE !== stateFips,
    );
  }, [loadOtherStates, stateAbbr, allDistricts]);

  // Sends the other states into the open map. Runs both when the background
  // load finishes and whenever the map (re)loads, whichever comes second.
  const injectOtherStates = useCallback(() => {
    if (!webViewLoaded.current || !otherStateDistricts?.length) return;
    webViewRef.current?.injectJavaScript(
      `window.addOtherStateDistricts && window.addOtherStateDistricts(${JSON.stringify(
        otherStateDistricts,
      )}); true;`,
    );
  }, [otherStateDistricts]);

  useEffect(() => {
    injectOtherStates();
  }, [injectOtherStates]);

  useEffect(() => {
    if (!visible || !webViewLoaded.current) return;
    webViewRef.current?.injectJavaScript(
      "window.redrawMap && window.redrawMap(); true;",
    );
  }, [visible]);
>>>>>>> origin/master

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadMap = async () => {
      setLoading(true);
      setError(null);

      try {
<<<<<<< HEAD
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
=======
        const response = await fetch(buildQueryUrl(stateAbbr), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load map data");
        }

        const data = (await response.json()) as DistrictCollection;
        if (!active) return;
        setFeatures(definedDistricts(data));
>>>>>>> origin/master
      } catch (fetchError) {
        if (!active || controller.signal.aborted) return;
        console.error("District map load failed:", fetchError);
        setError("Couldn't load the district map right now.");
        setFeatures([]);
<<<<<<< HEAD
        setAlaskaFeatures([]);
        setHawaiiFeatures([]);
=======
>>>>>>> origin/master
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
<<<<<<< HEAD
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
=======
    if (height) return height;
    const sized = stateAbbr
      ? Math.min(720, Math.max(520, screenWidth * 1.36))
      : Math.min(880, Math.max(600, screenWidth * 1.56));
    // On short phones, leave some of the page showing above or below the map
    // so there's room to scroll past it (the map pans with one finger)
    return Math.min(sized, Math.round(screenHeight * 0.72));
  }, [height, screenWidth, screenHeight, stateAbbr]);

  const matchedFocusDistricts = useMemo(() => {
    if (!focusDistricts?.length || !features.length) return [];
    return features.filter((feature) =>
      matchesFocusDistrict(feature, focusDistricts),
    );
  }, [features, focusDistricts]);
>>>>>>> origin/master

  const highlightGeoids = useMemo(
    () => matchedFocusDistricts.map((feature) => feature.properties.GEOID),
    [matchedFocusDistricts],
  );

  const initialSelectedGEOID =
<<<<<<< HEAD
    matchedFocusDistricts[0]?.properties.GEOID ?? null;

  useEffect(() => {
    if (!matchedFocusDistricts.length) {
=======
    selectedGeoid ??
    (autoSelectFocus
      ? (matchedFocusDistricts[0]?.properties.GEOID ?? null)
      : null);

  useEffect(() => {
    if (!autoSelectFocus || selectedGeoid || !matchedFocusDistricts.length) {
>>>>>>> origin/master
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

<<<<<<< HEAD
    onSelectDistrict({
=======
    onSelectDistrict?.({
>>>>>>> origin/master
      geoid: first.properties.GEOID,
      stateAbbr: firstAbbr,
      district: Number.isFinite(firstDistrict) ? firstDistrict : 0,
      label: first.properties.NAME,
    });
<<<<<<< HEAD
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
=======
  }, [matchedFocusDistricts, onSelectDistrict, autoSelectFocus, selectedGeoid]);

  const webViewSource = useMemo(
    () => ({
      html: buildOpenStreetMapHtml({
        features,
        highlightGeoids,
        initialSelectedGEOID,
        pinLocation: pinLocation ?? null,
        interactive,
      }),
      baseUrl: WEBVIEW_BASE_URL,
    }),
    [features, highlightGeoids, initialSelectedGEOID, pinLocation, interactive],
>>>>>>> origin/master
  );

  const webViewKey = useMemo(
    () =>
<<<<<<< HEAD
      `${stateAbbr ?? "all"}-${features.length}-${alaskaFeatures.length}-${hawaiiFeatures.length}-${highlightGeoids.join(",")}-${initialSelectedGEOID ?? "none"}`,
    [
      stateAbbr,
      features.length,
      alaskaFeatures.length,
      hawaiiFeatures.length,
      highlightGeoids,
      initialSelectedGEOID,
=======
      `${stateAbbr ?? "all"}-${features.length}-${highlightGeoids.join(",")}-${initialSelectedGEOID ?? "none"}-${pinLocation ? `${pinLocation.latitude},${pinLocation.longitude}` : "nopin"}`,
    [
      stateAbbr,
      features.length,
      highlightGeoids,
      initialSelectedGEOID,
      pinLocation,
>>>>>>> origin/master
    ],
  );

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        district?: DistrictSelection;
      };

      if (message.type !== "select" || !message.district) return;
<<<<<<< HEAD
      onSelectDistrict(message.district);
=======
      onSelectDistrict?.(message.district);
>>>>>>> origin/master
    } catch (error) {
      console.warn("Ignored district map message:", error);
    }
  };

<<<<<<< HEAD
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
=======
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
        width: mapWidth,
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
          ref={webViewRef}
          key={webViewKey}
          source={webViewSource}
          onLoadStart={() => {
            webViewLoaded.current = false;
          }}
          onLoadEnd={() => {
            webViewLoaded.current = true;
            injectOtherStates();
          }}
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
            width: mapWidth,
            height: mapHeight,
            backgroundColor: "#F7F4EF",
          }}
        />
      )}
>>>>>>> origin/master
    </View>
  );
}
