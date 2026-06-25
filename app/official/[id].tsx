import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  Bell,
  BellOff,
  BellRing,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Plus,
  Search,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  Image,
  Linking,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import SortDropdown from "../bill/bill_components/SortDropdown";
import officialsStatic from "../data/officials-static.json";
import AddModal from "../global_components/AddModal";
import ErrorScreen from "../global_components/ErrorScreen";
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import ScreenTourOverlay, {
  ScreenTourStep,
} from "../global_components/ScreenTourOverlay";
import SearchModal from "../global_components/SearchModal";
import { officialsService } from "../services/officials";
import { abbrevBillType } from "../utils/billTypeAbbr";
import { billCongressCache } from "../utils/billCongressCache";
import { getBillIcon } from "../utils/billIcons";
import { getDb } from "../utils/database";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { notificationPreferences } from "../utils/notificationPreferences";
import { officialBillsCache } from "../utils/officialBillsCache";
import { screenTour } from "../utils/screenTour";
import { storage } from "../utils/storage";
import { syncPreferencesToBackend } from "../utils/syncPreferences";
import { trySwipeBack } from "../utils/swipeBackGuard";
import OptionsModal from "./official_components/OptionsModal";
import { styles as componentStyles } from "./styles";

const POLICY_AREA_COLORS: Record<string, string> = {
  "Agriculture and Food": "#7CB342",
  Animals: "#8D6E63",
  "Armed Forces and National Security": "#455A64",
  "Arts, Culture, Religion": "#AB47BC",
  "Civil Rights and Liberties, Minority Issues": "#E53935",
  Commerce: "#00ACC1",
  Congress: "#1565C0",
  "Crime and Law Enforcement": "#424242",
  "Economics and Public Finance": "#4CAF82",
  Education: "#F5A623",
  "Emergency Management": "#FF5722",
  Energy: "#E67E22",
  "Environmental Protection": "#43A047",
  Families: "#F06292",
  "Finance and Financial Sector": "#4CAF82",
  "Foreign Trade and International Finance": "#9B59B6",
  "Government Operations and Politics": "#6B7FD4",
  Health: "#E53935",
  "Housing and Community Development": "#FF8F00",
  Immigration: "#00897B",
  "International Affairs": "#1E88E5",
  "Labor and Employment": "#6D4C41",
  Law: "#546E7A",
  "Native Americans": "#BF360C",
  "Public Lands and Natural Resources": "#27AE60",
  "Science, Technology, Communications": "#0288D1",
  "Social Welfare": "#E91E8C",
  "Sports and Recreation": "#00BCD4",
  Taxation: "#F9A825",
  "Transportation and Public Works": "#5C6BC0",
  "Water Resources Development": "#0277BD",
};

const LEADERSHIP_ROLES: Record<string, string> = {
  J000299: "Speaker of the House",
  S001176: "House Majority Leader",
  J000294: "House Minority Leader",
  E000294: "House Majority Whip",
  C001101: "House Minority Whip",
  T000250: "Senate Majority Leader",
  S000148: "Senate Minority Leader",
  B001261: "Senate Majority Whip",
  D000563: "Senate Minority Whip",
  G000386: "President Pro Tempore",
};

function LegislationCard({ item }: { item: any }) {
  const router = useRouter();
  const policyArea = item.policyArea?.name ?? null;
  const dotColor = POLICY_AREA_COLORS[policyArea] ?? "#008CFF";

  const safeFormatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const dateStr = safeFormatDate(
    item.latestAction?.actionDate ?? item.introducedDate,
  );
  return (
    <Pressable
      onPress={() =>
        router.navigate(`/bill/${item.type.toLowerCase()}${item.number}`)
      }
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
    >
      <View style={componentStyles.billCard}>
        {/* Left column: badge + icon */}
        <View
          style={{
            alignItems: "center",
            marginRight: 12,
            flexShrink: 0,
            width: 64,
          }}
        >
          <View
            style={{
              backgroundColor: dotColor,
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 4,
              marginBottom: 6,
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text
              style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
              numberOfLines={1}
            >
              {abbrevBillType(item.type)}.{item.number}
            </Text>
          </View>
          <Image
            source={getBillIcon(policyArea)}
            style={{ width: 50, height: 50, borderRadius: 6 }}
            resizeMode="contain"
          />
        </View>

        {/* Info */}
        <View
          style={{
            flex: 1,
            alignSelf: "stretch",
            justifyContent: "space-between",
          }}
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "nowrap",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 12, color: "#7B7C81", flexShrink: 0 }}>
                {dateStr}
              </Text>
              {policyArea && (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#000",
                      marginHorizontal: 4,
                      fontWeight: "900",
                    }}
                  >
                    ·
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: dotColor,
                      fontWeight: "600",
                      flexShrink: 1,
                    }}
                    numberOfLines={1}
                  >
                    {policyArea}
                  </Text>
                </>
              )}
            </View>
            <Text
              style={{ fontSize: 15, color: "#535353", fontWeight: "600" }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: "#7B7C81" }} numberOfLines={1}>
            {item.latestAction?.text ?? "No action yet"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function OfficialDetail() {
  // console.log("OfficialDetail render:", Date.now());
  const pagerRef = useRef<PagerView>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router: Router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };
  const [activeTab, setActiveTab] = useState(0);
  // const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  // Back swipe on first page
  const backSwipePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dx > 20 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 && Math.abs(gestureState.vx) > 0.3 && trySwipeBack()) {
          handleBack();
        }
      },
    }),
  ).current;

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most Recent Action");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sponsoredChambers, setSponsoredChambers] = useState<string[]>([]);
  const [sponsoredPolicyAreas, setSponsoredPolicyAreas] = useState<string[]>([]);
  const [sponsoredLegislationTypes, setSponsoredLegislationTypes] = useState<string[]>([]);
  const [cosponsoredChambers, setCosponsoredChambers] = useState<string[]>([]);
  const [cosponsoredPolicyAreas, setCosponsoredPolicyAreas] = useState<string[]>([]);
  const [cosponsoredLegislationTypes, setCosponsoredLegislationTypes] = useState<string[]>([]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const officialNotifId = `official_${id}`;
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [notifVersion, setNotifVersion] = useState(0);
  const notifSubTypes = React.useMemo(
    () => notificationPreferences.getSubTypes(officialNotifId),
    [notifVersion],
  );
  const notifState =
    notifSubTypes.length === 0
      ? "none"
      : notifSubTypes.includes("all-notications")
        ? "all"
        : "some";
  useFocusEffect(
    useCallback(() => {
      setNotifVersion((v) => v + 1);
    }, []),
  );
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const [imageError, setImageError] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourLayouts, setTourLayouts] = useState<
    ({ x: number; y: number; width: number; height: number } | null)[]
  >([null, null, null, null]);

  const headerRef = useRef<View>(null);
  const signedIntoLawRef = useRef<View>(null);
  const policyAreasRef = useRef<View>(null);
  const tabBarRef = useRef<View>(null);

  const [showActionToast, setShowActionToast] = useState(false);
  const [actionToastMessage, setActionToastMessage] = useState("");

  useEffect(() => {
    setImageError(false);
  }, [id]);

  useEffect(() => {
    if (!showNewListProgressModal) return;
    setNewListProgress(0);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setNewListProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowNewListProgressModal(false);
          setNewListProgress(0);
        }, 300);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [showNewListProgressModal]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true; // true = we handled it, prevents default back behavior
      },
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const checkTour = async () => {
      // await AsyncStorage.removeItem("official_tour_seen"); // temporary test line
      const isRelaunch = await screenTour.isRelaunchOfficialTour();
      if (isRelaunch) {
        await screenTour.clearRelaunchOfficialTour();
        await screenTour.markOfficialTourSeen();
        setTimeout(() => setTourActive(true), 800);
        return;
      }
      const seen = await screenTour.hasSeenOfficialTour();
      if (!seen) {
        await screenTour.markOfficialTourSeen();
        setTimeout(() => setTourActive(true), 800);
      }
    };
    checkTour();
  }, []);

  useEffect(() => {
    if (!tourActive) return;
    const delay = 300;
    setTimeout(() => {
      headerRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0)
          setTourLayouts((prev) => {
            const next = [...prev];
            next[0] = { x, y, width, height };
            return next;
          });
      });
    }, delay);
    setTimeout(() => {
      signedIntoLawRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0)
          setTourLayouts((prev) => {
            const next = [...prev];
            next[1] = { x, y, width, height };
            return next;
          });
      });
    }, delay);
    setTimeout(() => {
      policyAreasRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0)
          setTourLayouts((prev) => {
            const next = [...prev];
            next[2] = { x, y, width, height };
            return next;
          });
      });
    }, delay);
    setTimeout(() => {
      tabBarRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0)
          setTourLayouts((prev) => {
            const next = [...prev];
            next[3] = { x, y, width, height };
            return next;
          });
      });
    }, delay);
  }, [tourActive]);

  useEffect(() => {
    if (!tourActive) return;
    const refs = [headerRef, signedIntoLawRef, policyAreasRef, tabBarRef];
    const ref = refs[tourStep];
    setTimeout(() => {
      ref?.current?.measureInWindow((x, y, width, height) => {
        if (width > 0) {
          setTourLayouts((prev) => {
            const next = [...prev];
            next[tourStep] = { x, y, width, height };
            return next;
          });
        }
      });
    }, 300);
  }, [tourStep, tourActive]);

  const handleNewListCreate = async () => {
    if (newListName.trim()) {
      const allLists = await storage.getLists();
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        items: pendingItemForNewList ? [pendingItemForNewList] : [],
      };
      allLists.push(newList);
      await storage.saveLists(allLists);
      // console.log("🔔 LIST_UPDATED emitted");
      listEvents.emit(LIST_UPDATED);
      setCreatedListName(newListName.trim());
      setShowNewListModal(false);
      setPendingItemForNewList(null);
      setShowNewListProgressModal(true);
      setTimeout(
        () => showToast(`Added to ${createdListName || newListName.trim()}`),
        1000,
      );
      setNewListName("");
    }
  };

  interface FilterOption {
    id: string;
    label: string;
  }

  const toggleChamber = (id: string) => {
    const set = activeTab === 2 ? setSponsoredChambers : setCosponsoredChambers;
    set((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const togglePolicyArea = (id: string) => {
    const set = activeTab === 2 ? setSponsoredPolicyAreas : setCosponsoredPolicyAreas;
    set((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleLegislationType = (id: string) => {
    const set = activeTab === 2 ? setSponsoredLegislationTypes : setCosponsoredLegislationTypes;
    set((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleCancel = () => {
    if (activeTab === 2) {
      setSponsoredChambers([]);
      setSponsoredPolicyAreas([]);
      setSponsoredLegislationTypes([]);
    } else {
      setCosponsoredChambers([]);
      setCosponsoredPolicyAreas([]);
      setCosponsoredLegislationTypes([]);
    }
    setShowFilterModal(false);
  };

  const handleApply = () => {
    setShowFilterModal(false);
  };

  const showToast = (message: string) => {
    setActionToastMessage(message);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 1500);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["official", id],
    queryFn: () => officialsService.getById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // add this
  });

  const cachedSponsored = officialBillsCache.get(`sponsored_v2_${id}`);
  const cachedCosponsored = officialBillsCache.get(`cosponsored_v2_${id}`);

  const { data: sponsoredData, isLoading: sponsoredLoading } = useQuery({
    queryKey: ["officialSponsored", id],
    queryFn: async () => {
      const cached = officialBillsCache.get(`sponsored_v2_${id}`);
      if (cached) return cached;
      const result = await officialsService.getSponsored(id as string);
      officialBillsCache.save(`sponsored_v2_${id}`, result);
      return result;
    },
    enabled: !!id,
    retry: 1,
    initialData: cachedSponsored ?? undefined,
    staleTime: 5 * 60 * 1000, // add this
  });

  const { data: cosponsoredData, isLoading: cosponsoredLoading } = useQuery({
    queryKey: ["officialCosponsored", id],
    queryFn: async () => {
      const cached = officialBillsCache.get(`cosponsored_v2_${id}`);
      if (cached) return cached;
      const result = await officialsService.getCosponsored(id as string);
      officialBillsCache.save(`cosponsored_v2_${id}`, result);
      return result;
    },
    enabled: !!id,
    retry: 1,
    initialData: cachedCosponsored ?? undefined,
    staleTime: 5 * 60 * 1000, // add this
  });

  // Add after the policyAreasData query
  const { data: bioData, isLoading: bioLoading } = useQuery({
    queryKey: ["officialBio", id],
    queryFn: () => officialsService.getBio(id as string),
    enabled: !!id,
    retry: 1,
  });

  const official = data?.member;

  const staticData = (officialsStatic as any)[id as string] ?? {
    committees: [],
    caucuses: [],
    education: [],
  };

  const sponsoredBills = useMemo(
    () =>
      (sponsoredData?.legislation ?? []).filter(
        (item: any) =>
          !item.amendmentNumber && item.type && item.congress === 119,
      ),
    [sponsoredData],
  );

  const cosponsoredBills = useMemo(
    () =>
      (cosponsoredData?.legislation ?? []).filter(
        (item: any) =>
          !item.amendmentNumber &&
          item.type &&
          (item.congress === 119 || item.congress === "119"),
      ),
    [cosponsoredData],
  );

  const { filteredSponsored, filteredCosponsored } = useMemo(() => {
    const filterAndSort = (
      bills: any[],
      chambers: string[],
      policyAreas: string[],
      legTypes: string[],
    ) => {
      let filtered = bills;

      if (chambers.length > 0) {
        const houseTypes = ["HR", "HRES", "HJRES", "HCONRES", "HAMDT"];
        const senateTypes = ["S", "SRES", "SJRES", "SCONRES", "SAMDT", "PN", "TREATY"];
        filtered = filtered.filter((bill: any) => {
          if (chambers.includes("house") && houseTypes.includes(bill.type)) return true;
          if (chambers.includes("senate") && senateTypes.includes(bill.type)) return true;
          return false;
        });
      }

      if (legTypes.length > 0) {
        const typeMap: { [key: string]: string[] } = {
          bill: ["HR", "S"],
          joint_resolution: ["HJRES", "SJRES"],
          concurrent_resolution: ["HCONRES", "SCONRES"],
          resolution: ["HRES", "SRES"],
          amendment: ["HAMDT", "SAMDT"],
          nomination: ["PN"],
          treaty: ["TREATY"],
        };
        const apiTypes = legTypes.flatMap((id) => typeMap[id] || []);
        filtered = filtered.filter((bill: any) => apiTypes.includes(bill.type));
      }

      if (policyAreas.length > 0) {
        filtered = filtered.filter((bill: any) => {
          const area = bill.policyArea?.name ?? null;
          if (policyAreas.includes("none") && !area) return true;
          return area !== null && policyAreas.includes(area);
        });
      }

      const sorted = [...filtered];
      switch (selectedSort) {
        case "Most Recent Action":
          return sorted.sort(
            (a, b) =>
              new Date(b.latestAction?.actionDate ?? b.introducedDate ?? 0).getTime() -
              new Date(a.latestAction?.actionDate ?? a.introducedDate ?? 0).getTime(),
          );
        case "Newest First":
          return sorted.sort(
            (a, b) =>
              new Date(b.introducedDate ?? 0).getTime() -
              new Date(a.introducedDate ?? 0).getTime(),
          );
        case "Oldest First":
          return sorted.sort(
            (a, b) =>
              new Date(a.introducedDate ?? 0).getTime() -
              new Date(b.introducedDate ?? 0).getTime(),
          );
        case "Most Popular":
        default:
          return sorted;
      }
    };

    return {
      filteredSponsored: filterAndSort(sponsoredBills, sponsoredChambers, sponsoredPolicyAreas, sponsoredLegislationTypes),
      filteredCosponsored: filterAndSort(cosponsoredBills, cosponsoredChambers, cosponsoredPolicyAreas, cosponsoredLegislationTypes),
    };
  }, [
    sponsoredBills,
    cosponsoredBills,
    sponsoredChambers,
    sponsoredPolicyAreas,
    sponsoredLegislationTypes,
    cosponsoredChambers,
    cosponsoredPolicyAreas,
    cosponsoredLegislationTypes,
    selectedSort,
  ]);

  const { signedIntoLaw, signedSponsored, signedCosponsored } = useMemo(() => {
    if (sponsoredLoading) {
      return { signedIntoLaw: [], signedSponsored: [], signedCosponsored: [] };
    }

    const db = getDb();
    const seen = new Set<string>();

    // Deduplicate bills first
    const allBills = [...sponsoredBills, ...cosponsoredBills].filter((bill) => {
      const key = `${bill.type}${bill.number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (allBills.length === 0) {
      return { signedIntoLaw: [], signedSponsored: [], signedCosponsored: [] };
    }

    // Single batch query instead of N individual queries
    const billIds = allBills.map((b) => `${b.type.toLowerCase()}${b.number}`);
    const placeholders = billIds.map(() => "?").join(",");
    const rows = db.getAllSync<{
      bill_id: string;
      latest_action_text: string | null;
    }>(
      `SELECT bill_id, latest_action_text FROM bills WHERE bill_id IN (${placeholders})`,
      billIds,
    );

    const actionMap = new Map<string, string>();
    for (const row of rows) {
      if (row.latest_action_text) {
        actionMap.set(row.bill_id, row.latest_action_text.toLowerCase());
      }
    }

    const all = allBills
      .filter((bill) => {
        const billId = `${bill.type.toLowerCase()}${bill.number}`;
        const action = actionMap.get(billId) ?? "";
        return (
          action.includes("became public law") ||
          action.includes("signed by president") ||
          action.includes("veto overridden")
        );
      })
      .sort(
        (a, b) =>
          new Date(b.latestAction?.actionDate ?? 0).getTime() -
          new Date(a.latestAction?.actionDate ?? 0).getTime(),
      );

    const sponsoredSet = new Set(
      sponsoredBills.map((b: any) => `${b.type}${b.number}`),
    );

    return {
      signedIntoLaw: all,
      signedSponsored: all.filter((b) =>
        sponsoredSet.has(`${b.type}${b.number}`),
      ),
      signedCosponsored: all.filter(
        (b) => !sponsoredSet.has(`${b.type}${b.number}`),
      ),
    };
  }, [sponsoredBills, cosponsoredBills, sponsoredLoading, cosponsoredLoading]);

  const toSearchable = (bills: any[]) =>
    bills.map((item: any) => ({
      ...item,
      type: "bill",
      billType: item.type,
      name: `${item.type}.${item.number} - ${item.title}`,
      title: undefined,
      date: item.introducedDate,
      policyArea:
        typeof item.policyArea === "string"
          ? item.policyArea
          : (item.policyArea?.name ?? null),
    }));

  const topPolicyAreas: { name: string; count: number }[] = useMemo(() => {
    if (sponsoredLoading) return [];
    const counts: Record<string, number> = {};
    for (const bill of [...sponsoredBills, ...cosponsoredBills]) {
      const area =
        typeof bill.policyArea === "string"
          ? bill.policyArea
          : (bill.policyArea?.name ?? null);
      if (area) counts[area] = (counts[area] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [sponsoredBills, cosponsoredBills, sponsoredLoading, cosponsoredLoading]);

  const safeFormatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          Loading official...
        </Text>
      </View>
    );
  }

  if (error || !official) {
    return (
      <ErrorScreen
        onRetry={refetch}
        onBack={handleBack}
        message="Could not load this official"
      />
    );
  }

  // if (isNavigatingBack) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <LoadingSpinner />
  //     </View>
  //   );
  // }

  const officialTourSteps: ScreenTourStep[] = [
    {
      title: "Official Profile",
      description:
        "Each official's profile shows their party, role, and state. Tap Website or Contact to reach them directly.",
      targetLayout: tourLayouts[0],
    },
    {
      title: "Bills Signed Into Law",
      description:
        "This section shows legislation this official sponsored that became public law during the 119th Congress.",
      horizontalInset: 16,
      targetLayout: tourLayouts[1],
    },
    {
      title: "Top Policy Areas",
      description:
        "A breakdown of which policy areas this official sponsors and cosponsors the most legislation in.",
      targetLayout: tourLayouts[2],
    },
    {
      title: "Bio, Sponsor, & Cosponsor Tabs",
      description:
        "The Sponsor and Cosponsor tabs list every bill this official has introduced or co-signed in the current Congress. Tap either tab to explore.",
      horizontalInset: 16,
      targetLayout: tourLayouts[3],
    },
  ];

  return (
    <View style={componentStyles.screen}>
      {/* Edge swipe strip — must be outside PagerView so it isn't intercepted by horizontal page swipes */}
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
      {/* Header Bar */}
      <View style={componentStyles.headerBar}>
        <Pressable
          onPress={() => {
            handleBack();
          }}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <ChevronLeft size={24} color="#535353" />
        </Pressable>
        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Plus size={24} color="#535353" />
          </Pressable>
          <Pressable
            onPress={() => setShowOptionsModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            {notifState === "none" && <BellOff size={24} color="#535353" />}
            {notifState === "some" && <Bell size={24} color="#008CFF" />}
            {notifState === "all" && <BellRing size={24} color="#008CFF" />}
          </Pressable>
        </View>
      </View>

      {/* Official Header - fixed above tabs */}
      <View ref={headerRef} collapsable={false} style={componentStyles.header}>
        <Text style={componentStyles.roleTop}>
          {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
          {(() => {
            const lastTerm = official.terms?.[official.terms.length - 1];
            const TERRITORY_STATES = new Set(["GU", "VI", "AS", "MP", "PR", "DC"]);
            const isHouse =
              lastTerm?.chamber === "House of Representatives" ||
              lastTerm?.chamber === "House" ||
              TERRITORY_STATES.has(official.state) ||
              lastTerm?.district != null;
            if (isHouse) {
              const district = lastTerm?.district
                ? ` - District ${lastTerm.district}`
                : "";
              const full = `Representative, ${official.state}${district}`;
              const abbr = `Rep, ${official.state}${district}`;
              return screenWidth < 390 ? abbr : full;
            }
            return screenWidth < 390
              ? `Sen, ${official.state}`
              : `Senator, ${official.state}`;
          })()}
        </Text>
        {LEADERSHIP_ROLES[official.bioguideId] && (
          <Text style={componentStyles.roleTop}>
            {LEADERSHIP_ROLES[official.bioguideId]}
          </Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* Avatar */}
          <Pressable onPress={() => setShowPhotoModal(true)}>
            <View
              style={[
                componentStyles.avatar,
                {
                  borderColor:
                    official.partyHistory?.[0]?.partyName === "Republican"
                      ? "#D45252"
                      : official.partyHistory?.[0]?.partyName === "Democratic"
                        ? "#008CFF"
                        : official.partyHistory?.[0]?.partyName ===
                            "Independent"
                          ? "#FAEA70"
                          : "#008CFF",
                },
              ]}
            >
              {official.depiction?.imageUrl && !imageError ? (
                <Image
                  source={{ uri: official.depiction.imageUrl }}
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
                    {official.lastName?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* Name + Buttons */}
          <View
            style={{ flex: 1, justifyContent: "space-between", gap: 6 }}
          >
            <Text style={componentStyles.name}>{official.directOrderName}</Text>
            {official.officialWebsiteUrl && (
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Pressable
                  onPress={() => Linking.openURL(official.officialWebsiteUrl)}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      color: "#008CFF",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Website
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const contactUrl = `${official.officialWebsiteUrl.replace(/\/$/, "")}/contact`;
                    Linking.openURL(contactUrl);
                  }}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      color: "#008CFF",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Contact
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Tab Bar - fixed */}
      <View
        ref={tabBarRef} // or billTabBarRef
        collapsable={false}
        style={componentStyles.tabsNegative}
      >
        <View style={componentStyles.tabs}>
          {["Profile", "Bio", "Sponsor", "Cosponsor"].map((label, index) => (
            <Pressable
              key={label}
              onPress={() => {
                setActiveTab(index);
                pagerRef.current?.setPage(index);
              }}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === index && componentStyles.tabActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* PagerView for tab content */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        {/* Page 0: Profile */}
        <View key="0" style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Bills Signed Into Law */}
            <View
              ref={signedIntoLawRef}
              collapsable={false}
              style={{
                paddingHorizontal: 32,
                marginBottom: 8,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Bills Signed Into Law (2025 - )
              </Text>
            </View>
            {!sponsoredLoading ? (
              <>
                {signedSponsored.length > 0 ? (
                  <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                    {(signedSponsored as any[])
                      .sort(
                        (a: any, b: any) => Number(a.number) - Number(b.number),
                      )
                      .map((bill: any, index: number) => (
                        <LegislationCard
                          key={`sp-${bill.type}-${bill.number}-${index}`}
                          item={bill}
                        />
                      ))}
                  </View>
                ) : (
                  <View style={{ paddingHorizontal: 32, marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#7B7C81",
                        marginTop: 12,
                        marginBottom: 16,
                      }}
                    >
                      No sponsored legislation has become public law in the
                      119th Congress (2025–2027).
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View
                style={{
                  paddingTop: 12,
                  paddingBottom: 36,
                  alignItems: "center",
                }}
              >
                <LoadingSpinner />
                <Text style={{ color: "#7B7C81", marginTop: 24 }}>
                  Loading bills signed into law...
                </Text>
              </View>
            )}

            {/* Top Policy Areas */}
            <View
              ref={policyAreasRef}
              collapsable={false}
              style={componentStyles.section}
            >
              <View style={componentStyles.termRow}>
                <Text style={componentStyles.sectionTitle}>
                  Top Policy Areas (2025 - )
                </Text>
              </View>
              {topPolicyAreas.length > 0 ? (
                topPolicyAreas.map((area, index) => {
                  const color = POLICY_AREA_COLORS[area.name] ?? "#008CFF";
                  return (
                    <View
                      key={index}
                      style={[
                        componentStyles.termRow,
                        { alignItems: "center" },
                      ]}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 4,
                          backgroundColor: color,
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      />
                      <Text style={[componentStyles.term, { flex: 1 }]}>
                        {area.name}
                      </Text>
                      <Text
                        style={[
                          componentStyles.term,
                          { flex: 0, textAlign: "right" },
                        ]}
                      >
                        {area.count} bill{area.count !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  );
                })
              ) : sponsoredLoading ? (
                <View
                  style={{
                    paddingTop: 12,
                    paddingBottom: 36,
                    alignItems: "center",
                  }}
                >
                  <LoadingSpinner />
                  <Text style={{ color: "#7B7C81", marginTop: 24 }}>
                    Loading top policy areas...
                  </Text>
                </View>
              ) : (
                <Text style={[componentStyles.term, { paddingBottom: 12 }]}>
                  Top policy areas unavailable. This might be because this
                  official is still new.
                </Text>
              )}
            </View>

            {/* Committees */}
            {staticData.committees.length > 0 && (
              <View style={componentStyles.section}>
                <View style={componentStyles.termRow}>
                  <Text style={componentStyles.sectionTitle}>Committees</Text>
                </View>
                {staticData.committees.map(
                  (committee: string, index: number) => (
                    <View key={index} style={componentStyles.termRow}>
                      <Text style={componentStyles.term}>{committee}</Text>
                    </View>
                  ),
                )}
              </View>
            )}

            {/* Congressional History */}
            <View style={[componentStyles.section, { marginBottom: 96 }]}>
              <View style={componentStyles.termRow}>
                <Text style={componentStyles.sectionTitle}>
                  Congressional History
                </Text>
              </View>
              {official.terms && official.terms.length > 0 ? (
                [...official.terms]
                  .sort((a: any, b: any) => b.startYear - a.startYear)
                  .map((term: any, index: number) => (
                    <View key={index} style={componentStyles.termRow}>
                      <Text
                        style={[componentStyles.term, { flex: 1 }]}
                        numberOfLines={1}
                      >
                        {term.chamber === "Senate" ? "Senator" : "Rep"},{" "}
                        {official.state}
                        {term.district ? `, District ${term.district}` : ""}
                      </Text>
                      <Text
                        style={[
                          componentStyles.term,
                          { flex: 0, textAlign: "right" },
                        ]}
                      >
                        {term.startYear}
                        {term.endYear ? ` – ${term.endYear}` : " – Present"}
                      </Text>
                    </View>
                  ))
              ) : (
                <View style={componentStyles.termRow}>
                  <Text style={componentStyles.term}>
                    {official.terms?.[0]?.chamber === "House of Representatives"
                      ? `Representative, ${official.state}`
                      : `Senator, ${official.state}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Caucuses */}
            {staticData.caucuses.length > 0 && (
              <View style={componentStyles.section}>
                <View style={componentStyles.termRow}>
                  <Text style={componentStyles.sectionTitle}>Caucuses</Text>
                </View>
                {staticData.caucuses.map((caucus: string, index: number) => (
                  <View key={index} style={componentStyles.termRow}>
                    <Text style={componentStyles.term}>{caucus}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Page 1: Bio */}
        <View key="1" style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ marginBottom: 96, paddingTop: 4 }}>
              {/* Education */}
              {staticData.education.length > 0 && (
                <View style={componentStyles.section}>
                  <View style={componentStyles.termRow}>
                    <Text style={componentStyles.sectionTitle}>Education</Text>
                  </View>
                  {staticData.education.map((edu: string, index: number) => (
                    <View key={index} style={componentStyles.termRow}>
                      <Text style={componentStyles.term}>{edu}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Biography */}
              {bioLoading ? (
                <View
                  style={{
                    paddingTop: 12,
                    paddingBottom: 36,
                    alignItems: "center",
                  }}
                >
                  <LoadingSpinner />
                  <Text style={{ color: "#7B7C81", marginBottom: 24 }}>
                    Loading biography...
                  </Text>
                </View>
              ) : bioData?.profileText ? (
                <View style={componentStyles.section}>
                  <View style={componentStyles.termRow}>
                    <Text style={componentStyles.sectionTitle}>Biography</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      paddingBottom: 16,
                      marginTop: 12,
                    }}
                  >
                    {bioData.profileText
                      .split(";")
                      .map((s: string) => s.trim())
                      .filter((s: string) => s.length > 0)
                      .filter((s: string, i: number) => {
                        if (i !== 0) return true;
                        const lower = s.toLowerCase();
                        return (
                          !lower.startsWith("a representative from") &&
                          !lower.startsWith("a senator from") &&
                          !lower.startsWith(
                            "a senator and representative from",
                          ) &&
                          !lower.startsWith(
                            "a representative and senator from",
                          ) &&
                          !lower.startsWith(
                            "a senator and a representative from",
                          ) &&
                          !lower.startsWith(
                            "a representative and a senator from",
                          )
                        );
                      })
                      .map((s: string, i: number, arr: string[]) => {
                        const capitalized =
                          s.charAt(0).toUpperCase() + s.slice(1);
                        return (
                          <View
                            key={i}
                            style={{
                              backgroundColor: "#f0f0f0",
                              borderRadius: 20,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                            }}
                          >
                            <Text style={{ fontSize: 13, color: "#535353" }}>
                              {capitalized}
                            </Text>
                          </View>
                        );
                      })}
                  </View>
                </View>
              ) : (
                <View style={{ padding: 32, alignItems: "center" }}>
                  <Text style={{ color: "#7B7C81", fontSize: 14 }}>
                    Biography not available.
                  </Text>
                </View>
              )}

              {/* Books */}
              {bioData?.creativeWork?.length > 0 && (
                <View style={componentStyles.section}>
                  <View style={componentStyles.termRow}>
                    <Text style={componentStyles.sectionTitle}>
                      Published Works
                    </Text>
                  </View>
                  {bioData.creativeWork.map((work: any, index: number) => {
                    const raw =
                      work.name ??
                      work.freeFormCitationText?.replace(/<[^>]*>/g, "") ??
                      "";
                    const cleaned = raw.replace(/^_{1,3}\.\s*/, "").trim();
                    if (!cleaned) return null;
                    return (
                      <View key={index} style={componentStyles.termRow}>
                        <Text
                          style={[
                            componentStyles.term,
                            { fontStyle: "italic" },
                          ]}
                        >
                          {cleaned}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Page 1: Sponsored */}
        <View key="2" style={{ flex: 1, marginHorizontal: 16 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ marginBottom: 96 }}>
              {sponsoredLoading ? (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 60,
                  }}
                >
                  <LoadingSpinner />
                  <Text
                    style={{ color: "#7B7C81", marginTop: 16, fontSize: 13 }}
                  >
                    Loading legislation...
                  </Text>
                </View>
              ) : (
                <>
                  <View style={componentStyles.legislationHeader}>
                    <View style={componentStyles.legislationHeaderLeft}>
                      <Pressable
                        style={({ pressed }) => [
                          componentStyles.button,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                        ]}
                        onPress={() => setShowFilterModal(true)}
                      >
                        {screenWidth < 390 ? (
                          <View>
                            <Text
                              style={[
                                componentStyles.legislationHeaderTotal,
                                { fontSize: 12 },
                              ]}
                            >
                              {`${filteredSponsored.length.toLocaleString()} in 119th`}
                            </Text>
                            <Text
                              style={[
                                componentStyles.legislationHeaderTotal,
                                { fontSize: 12 },
                              ]}
                            >
                              {`${(sponsoredData?.count ?? 0).toLocaleString()} all-time`}
                            </Text>
                          </View>
                        ) : (
                          <Text style={componentStyles.legislationHeaderTotal}>
                            {`${filteredSponsored.length.toLocaleString()} in 119th · ${(sponsoredData?.count ?? 0).toLocaleString()} all-time`}
                          </Text>
                        )}
                        {showFilterModal ? (
                          <ChevronUp size={16} color="#7B7C81" />
                        ) : (
                          <ChevronDown size={16} color="#7B7C81" />
                        )}
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          componentStyles.button,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                        ]}
                        onPress={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        <Text
                          style={[
                            componentStyles.sortText,
                            {
                              fontSize: screenWidth < 390 ? 11 : 13,
                              flexShrink: 1,
                              marginRight: 0,
                            },
                          ]}
                        >
                          {selectedSort}
                        </Text>
                        <View style={{ flexShrink: 0 }}>
                          {showSortDropdown ? (
                            <ChevronUp size={16} color="#7B7C81" />
                          ) : (
                            <ChevronDown size={16} color="#7B7C81" />
                          )}
                        </View>
                      </Pressable>
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        componentStyles.button,
                        { transform: [{ scale: pressed ? 0.75 : 1 }] },
                      ]}
                      onPress={() => setShowSearchModal(true)}
                    >
                      <Search size={24} color="#535353" />
                    </Pressable>
                  </View>

                  {filteredSponsored.length === 0 ? (
                    <View style={{ paddingVertical: 60, alignItems: "center" }}>
                      <Text style={{ color: "#7B7C81", fontSize: 13 }}>
                        No legislation found
                      </Text>
                    </View>
                  ) : (
                    filteredSponsored.map((item: any, index: number) => (
                      <LegislationCard
                        key={`${item.type}-${item.number}-${item.congress}-${index}`}
                        item={item}
                      />
                    ))
                  )}
                </>
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: "#535353",
                  textAlign: "center",
                  paddingVertical: 16,
                }}
              >
                Bills are currently limited to the 119th Congress (2025–2027).
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Page 2: Cosponsored */}
        <View key="3" style={{ flex: 1, marginHorizontal: 16 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ marginBottom: 96 }}>
              {cosponsoredLoading ? (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 60,
                  }}
                >
                  <LoadingSpinner />
                  <Text
                    style={{ color: "#7B7C81", marginTop: 16, fontSize: 13 }}
                  >
                    Loading legislation...
                  </Text>
                </View>
              ) : (
                <>
                  <View style={componentStyles.legislationHeader}>
                    <View style={componentStyles.legislationHeaderLeft}>
                      <Pressable
                        style={({ pressed }) => [
                          componentStyles.button,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                        ]}
                        onPress={() => setShowFilterModal(true)}
                      >
                        {screenWidth < 390 ? (
                          <View>
                            <Text
                              style={[
                                componentStyles.legislationHeaderTotal,
                                { fontSize: 12 },
                              ]}
                            >
                              {`${filteredCosponsored.length.toLocaleString()} in 119th`}
                            </Text>
                            <Text
                              style={[
                                componentStyles.legislationHeaderTotal,
                                { fontSize: 12 },
                              ]}
                            >
                              {`${(cosponsoredData?.count ?? 0).toLocaleString()} all-time`}
                            </Text>
                          </View>
                        ) : (
                          <Text style={componentStyles.legislationHeaderTotal}>
                            {`${filteredCosponsored.length.toLocaleString()} in 119th · ${(cosponsoredData?.count ?? 0).toLocaleString()} all-time`}
                          </Text>
                        )}
                        {showFilterModal ? (
                          <ChevronUp size={16} color="#7B7C81" />
                        ) : (
                          <ChevronDown size={16} color="#7B7C81" />
                        )}
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          componentStyles.button,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                        ]}
                        onPress={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        <Text
                          style={[
                            componentStyles.sortText,
                            {
                              fontSize: screenWidth < 390 ? 11 : 13,
                              flexShrink: 1,
                              marginRight: 0,
                            },
                          ]}
                        >
                          {selectedSort}
                        </Text>
                        <View style={{ flexShrink: 0 }}>
                          {showSortDropdown ? (
                            <ChevronUp size={16} color="#7B7C81" />
                          ) : (
                            <ChevronDown size={16} color="#7B7C81" />
                          )}
                        </View>
                      </Pressable>
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        componentStyles.button,
                        { transform: [{ scale: pressed ? 0.75 : 1 }] },
                      ]}
                      onPress={() => setShowSearchModal(true)}
                    >
                      <Search size={24} color="#535353" />
                    </Pressable>
                  </View>

                  {filteredCosponsored.length === 0 ? (
                    <View style={{ paddingVertical: 60, alignItems: "center" }}>
                      <Text style={{ color: "#7B7C81", fontSize: 13 }}>
                        No legislation found
                      </Text>
                    </View>
                  ) : (
                    filteredCosponsored.map((item: any, index: number) => (
                      <LegislationCard
                        key={`${item.type}-${item.number}-${item.congress}-${index}`}
                        item={item}
                      />
                    ))
                  )}
                </>
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: "#535353",
                  textAlign: "center",
                  paddingVertical: 16,
                }}
              >
                Bills are currently limited to the 119th Congress (2025–2027).
              </Text>
            </View>
          </ScrollView>
        </View>
      </PagerView>

      {/* Modals - outside PagerView */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={activeTab === 2 ? "Sponsored" : "Cosponsored"}
        items={toSearchable(
          activeTab === 2 ? filteredSponsored : filteredCosponsored,
        )}
        onItemPress={(item) => {
          router.navigate(`/bill/${item.billType.toLowerCase()}${item.number}`);
          setShowSearchModal(false);
        }}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
      />

      <SortDropdown
        showSortDropdown={showSortDropdown}
        setShowSortDropdown={setShowSortDropdown}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        dropdownType="sponsored"
      />

      <LegislationFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedChambers={activeTab === 2 ? sponsoredChambers : cosponsoredChambers}
        selectedPolicyAreas={activeTab === 2 ? sponsoredPolicyAreas : cosponsoredPolicyAreas}
        selectedLegislationTypes={activeTab === 2 ? sponsoredLegislationTypes : cosponsoredLegislationTypes}
        toggleChamber={toggleChamber}
        togglePolicyArea={togglePolicyArea}
        toggleLegislationType={toggleLegislationType}
        onCancel={handleCancel}
        onApply={handleApply}
        setSelectedChambers={activeTab === 2 ? setSponsoredChambers : setCosponsoredChambers}
        setSelectedPolicyAreas={activeTab === 2 ? setSponsoredPolicyAreas : setCosponsoredPolicyAreas}
        setSelectedLegislationTypes={activeTab === 2 ? setSponsoredLegislationTypes : setCosponsoredLegislationTypes}
        resultCount={activeTab === 2 ? filteredSponsored.length : filteredCosponsored.length}
      />

      <AddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
        currentItem={{
          id: official.bioguideId,
          type: "official",
          name: official.directOrderName,
          party: official.partyHistory?.[0]?.partyName?.charAt(0) || "",
          role: (() => {
            const t = official.terms?.[official.terms.length - 1];
            const TERRITORY_STATES = new Set(["GU", "VI", "AS", "MP", "PR", "DC"]);
            const isHouse =
              t?.chamber === "House of Representatives" ||
              t?.chamber === "House" ||
              TERRITORY_STATES.has(official.state) ||
              t?.district != null;
            return isHouse
              ? `Representative, ${official.state}${t?.district ? ` - District ${t.district}` : ""}`
              : `Senator, ${official.state}`;
          })(),
          photoUrl: official.depiction?.imageUrl,
        }}
      />

      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={(val) => {
          setShowOptionsModal(val);
          if (!val) {
            setNotifVersion((v) => v + 1);
            syncPreferencesToBackend();
          }
        }}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
        itemId={officialNotifId}
        itemType="official"
        officialName={official?.directOrderName}
      />

      <NewListNameModal
        visible={showNewListModal}
        onClose={() => {
          setShowNewListModal(false);
          setNewListName("");
        }}
        onConfirm={handleNewListCreate}
        value={newListName}
        onChangeText={setNewListName}
      />
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowPhotoModal(false)}
        >
          {official.depiction?.imageUrl && (
            <Image
              source={{ uri: official.depiction.imageUrl }}
              style={{ width: 300, height: 360, borderRadius: 16 }}
              resizeMode="cover"
            />
          )}
        </Pressable>
      </Modal>
      <Modal
        visible={showNewListProgressModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={[componentStyles.modalOverlay, { justifyContent: "center" }]}
          onPress={() => {}}
        >
          <View
            style={{
              backgroundColor: "#f5f5f5",
              marginHorizontal: 16,
              borderRadius: 16,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1a1a1a",
                marginTop: 8,
                marginBottom: 32,
                textAlign: "center",
              }}
            >
              Creating and adding to {createdListName || "new list"}...
            </Text>
            <View
              style={{
                width: "100%",
                height: 6,
                backgroundColor: "#e0e0e0",
                borderRadius: 3,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${newListProgress}%`,
                  height: "100%",
                  backgroundColor: "#00AFFF",
                  borderRadius: 3,
                }}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "#7B7C81",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {Math.round(newListProgress)}%
            </Text>
            <Pressable
              onPress={async () => {
                const allLists = await storage.getLists();
                const newlyCreatedList = allLists.find(
                  (l) => l.name === createdListName,
                );
                if (newlyCreatedList) {
                  await storage.deleteList(newlyCreatedList.id);
                }
                setShowNewListProgressModal(false);
                setNewListProgress(0);
                setCreatedListName("");
              }}
              style={({ pressed }) => ({
                transform: pressed ? [{ scale: 0.96 }] : [],
              })}
            >
              <Text
                style={{ fontSize: 14, color: "#535353", textAlign: "center" }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {tourActive && tourLayouts[tourStep] && (
        <ScreenTourOverlay
          steps={officialTourSteps}
          currentStep={tourStep}
          onNext={async () => {
            if (tourStep < officialTourSteps.length - 1) {
              setTourStep((s) => s + 1);
            }
          }}
          onEnd={async () => {
            setTourActive(false);
            setTourStep(0);
            // If this was a relaunch, now trigger the bill tour
            const wasRelaunch = await AsyncStorage.getItem(
              "pending_bill_tour_after_official",
            );
            if (wasRelaunch === "true") {
              await AsyncStorage.removeItem("pending_bill_tour_after_official");
              billCongressCache.set("hr22", 119);
              await screenTour.triggerRelaunchBillTour();
              router.push("/bill/hr22" as any);
            }
          }}
        />
      )}
      {showActionToast && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              backgroundColor: "#535353",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: "#fff", fontWeight: "500" }}>
              {actionToastMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
