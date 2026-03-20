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
import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";

import { useQuery } from "@tanstack/react-query";
import PagerView from "react-native-pager-view";
import SortDropdown from "../bill/bill_components/SortDropdown";
import officialsStatic from "../data/officials-static.json";
import AddModal from "../global_components/AddModal";
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import SearchModal from "../global_components/SearchModal";
import { officialsService } from "../services/officials";
import { getBillIcon } from "../utils/billIcons";
import { getDb } from "../utils/database";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { notificationPreferences } from "../utils/notificationPreferences";
import { officialBillsCache } from "../utils/officialBillsCache";
import { storage } from "../utils/storage";
import { syncPreferencesToBackend } from "../utils/syncPreferences";
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
              {item.type}.{item.number}
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
  const [activeTab, setActiveTab] = useState(0);
  // const [isNavigatingBack, setIsNavigatingBack] = useState(false);

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
        if (gestureState.dx > 50 && Math.abs(gestureState.vx) > 0.3) {
          // setIsNavigatingBack(true);
          // setTimeout(() => {
          //   router.back();
          // }, 50);
          router.back();
        }
      },
    }),
  ).current;

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most Viewed");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedChambers, setSelectedChambers] = useState<string[]>([]);
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<string[]>([]);
  const [selectedLegislationTypes, setSelectedLegislationTypes] = useState<
    string[]
  >([]);

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
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const [imageError, setImageError] = useState(false);

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
        // setIsNavigatingBack(true);
        // setTimeout(() => {
        //   router.back();
        // }, 50);
        router.back();
        return true; // true = we handled it, prevents default back behavior
      },
    );
    return () => subscription.remove();
  }, []);

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
      setNewListName("");
    }
  };

  interface FilterOption {
    id: string;
    label: string;
  }

  const toggleChamber = (id: string) => {
    setSelectedChambers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const togglePolicyArea = (id: string) => {
    setSelectedPolicyAreas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleLegislationType = (id: string) => {
    setSelectedLegislationTypes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCancel = () => {
    setSelectedChambers([]);
    setSelectedPolicyAreas([]);
    setSelectedLegislationTypes([]);
    setShowFilterModal(false);
  };

  const handleApply = () => {
    setShowFilterModal(false);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["official", id],
    queryFn: () => officialsService.getById(id as string),
    enabled: !!id,
  });

  const { data: sponsoredData, isLoading: sponsoredLoading } = useQuery({
    queryKey: ["officialSponsored", id],
    queryFn: async () => {
      const cached = await officialBillsCache.get(`sponsored_${id}`);
      if (cached) return cached;
      const result = await officialsService.getSponsored(id as string);
      await officialBillsCache.save(`sponsored_${id}`, result);
      return result;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: cosponsoredData, isLoading: cosponsoredLoading } = useQuery({
    queryKey: ["officialCosponsored", id],
    queryFn: async () => {
      const cached = await officialBillsCache.get(`cosponsored_${id}`);
      if (cached) return cached;
      const result = await officialsService.getCosponsored(id as string);
      await officialBillsCache.save(`cosponsored_${id}`, result);
      return result;
    },
    enabled: !!id,
    retry: 1,
  });

  const { data: policyAreasData, isLoading: policyAreasLoading } = useQuery({
    queryKey: ["officialPolicyAreas", id],
    queryFn: async () => {
      const cached = await officialBillsCache.get(
        `policy_areas_v3_${id}`,
        30 * 24 * 60 * 60 * 1000,
      );
      if (cached) return cached;
      const result = await officialsService.getPolicyAreas(id as string);
      await officialBillsCache.save(
        `policy_areas_v3_${id}`,
        result,
        30 * 24 * 60 * 60 * 1000,
      );
      return result;
    },
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
          (item.congress === 119 || item.congress === "119" || !item.congress),
      ),
    [cosponsoredData],
  );

  const { filteredSponsored, filteredCosponsored } = useMemo(() => {
    const filterAndSort = (bills: any[]) => {
      let filtered = bills;

      if (selectedChambers.length > 0) {
        const houseTypes = ["HR", "HRES", "HJRES", "HCONRES", "HAMDT"];
        const senateTypes = [
          "S",
          "SRES",
          "SJRES",
          "SCONRES",
          "SAMDT",
          "PN",
          "TREATY",
        ];
        filtered = filtered.filter((bill: any) => {
          if (
            selectedChambers.includes("house") &&
            houseTypes.includes(bill.type)
          )
            return true;
          if (
            selectedChambers.includes("senate") &&
            senateTypes.includes(bill.type)
          )
            return true;
          return false;
        });
      }

      if (selectedLegislationTypes.length > 0) {
        const typeMap: { [key: string]: string[] } = {
          bill: ["HR", "S"],
          joint_resolution: ["HJRES", "SJRES"],
          concurrent_resolution: ["HCONRES", "SCONRES"],
          resolution: ["HRES", "SRES"],
          amendment: ["HAMDT", "SAMDT"],
          nomination: ["PN"],
          treaty: ["TREATY"],
        };
        const apiTypes = selectedLegislationTypes.flatMap(
          (id) => typeMap[id] || [],
        );
        filtered = filtered.filter((bill: any) => apiTypes.includes(bill.type));
      }

      const sorted = [...filtered];
      switch (selectedSort) {
        case "Most Recent Action":
          return sorted.sort(
            (a, b) =>
              new Date(
                b.latestAction?.actionDate ?? b.introducedDate ?? 0,
              ).getTime() -
              new Date(
                a.latestAction?.actionDate ?? a.introducedDate ?? 0,
              ).getTime(),
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
        case "Most Viewed":
        default:
          return sorted;
      }
    };

    return {
      filteredSponsored: filterAndSort(sponsoredBills),
      filteredCosponsored: filterAndSort(cosponsoredBills),
    };
  }, [
    sponsoredBills,
    cosponsoredBills,
    selectedLegislationTypes,
    selectedChambers,
    selectedSort,
  ]);

  const { signedIntoLaw, signedSponsored, signedCosponsored } = useMemo(() => {
    const db = getDb();
    const seen = new Set<string>();

    const all = [...sponsoredBills, ...cosponsoredBills]
      .filter((bill) => {
        const key = `${bill.type}${bill.number}`;
        if (seen.has(key)) return false;
        seen.add(key);
        const billId = `${bill.type.toLowerCase()}${bill.number}`;
        const row = db.getFirstSync<{ latest_action_text: string | null }>(
          `SELECT latest_action_text FROM bills WHERE bill_id = ?`,
          [billId],
        );
        const action = row?.latest_action_text?.toLowerCase() ?? "";
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

    // const testRow = db.getFirstSync<{ bill_id: string }>(
    //   `SELECT bill_id FROM bills LIMIT 1`,
    // );
    // console.log("Sample bill_id from SQLite:", testRow?.bill_id);

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
      policyArea: item.policyArea?.name ?? item.policyArea ?? null,
    }));

  const topPolicyAreas: { name: string; count: number }[] =
    policyAreasData?.policyAreas ?? [];

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading official</Text>
      </View>
    );
  }

  // if (isNavigatingBack) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <LoadingSpinner />
  //     </View>
  //   );
  // }

  return (
    <View style={componentStyles.screen}>
      {/* Header Bar */}
      <View style={componentStyles.headerBar}>
        <Pressable
          onPress={() => {
            // setIsNavigatingBack(true);
            // setTimeout(() => {
            //   router.back();
            // }, 50);
            // console.log("Back pressed:", Date.now());
            router.back();
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
      <View style={componentStyles.header}>
        <Text style={componentStyles.roleTop}>
          {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
          {official.terms?.[official.terms.length - 1]?.chamber ===
          "House of Representatives"
            ? `Representative, ${official.state}${official.terms?.[official.terms.length - 1]?.district ? ` - District ${official.terms[official.terms.length - 1].district}` : ""}`
            : `Senator, ${official.state}`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* Avatar */}
          <View
            style={[
              componentStyles.avatar,
              {
                borderColor:
                  official.partyHistory?.[0]?.partyName === "Republican"
                    ? "#D45252"
                    : official.partyHistory?.[0]?.partyName === "Democratic"
                      ? "#008CFF"
                      : official.partyHistory?.[0]?.partyName === "Independent"
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

          {/* Name + Buttons */}
          <View
            style={{ flex: 1, height: 64, justifyContent: "space-between" }}
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
      <View style={componentStyles.tabsNegative}>
        <View style={componentStyles.tabs}>
          {["Profile", "Sponsor", "Cosponsor"].map((label, index) => (
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
          {/* Edge swipe strip for back navigation */}
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
          <ScrollView keyboardShouldPersistTaps="handled">
            {/* Bills Signed Into Law */}
            <View
              style={{
                paddingHorizontal: 32,
                marginBottom: 8,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Bills Signed Into Law
              </Text>
            </View>
            {!sponsoredLoading && !cosponsoredLoading ? (
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
            <View style={componentStyles.section}>
              <View style={componentStyles.termRow}>
                <Text style={componentStyles.sectionTitle}>
                  Top Policy Areas
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
              ) : policyAreasLoading ? (
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
                    {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
                    {official.terms?.[0]?.chamber === "House of Representatives"
                      ? `Representative, ${official.state}${official.terms?.[0]?.district ? ` - District ${official.terms[0].district}` : ""}`
                      : `Senator, ${official.state}`}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Page 1: Sponsored */}
        <View key="1" style={{ flex: 1, marginHorizontal: 16 }}>
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
                        <Text style={componentStyles.legislationHeaderTotal}>
                          {`${filteredSponsored.length.toLocaleString()} / ${(policyAreasData?.totalSponsored ?? sponsoredData?.count ?? 0).toLocaleString()} all-time`}{" "}
                        </Text>
                        {showFilterModal ? (
                          <ChevronUp
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        ) : (
                          <ChevronDown
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        )}
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          componentStyles.button,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                        ]}
                        onPress={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        <Text style={componentStyles.sortText}>
                          {selectedSort}
                        </Text>
                        {showSortDropdown ? (
                          <ChevronUp
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        ) : (
                          <ChevronDown
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        )}
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
        <View key="2" style={{ flex: 1, marginHorizontal: 16 }}>
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
                        <Text style={componentStyles.legislationHeaderTotal}>
                          {`${filteredCosponsored.length.toLocaleString()} / ${(policyAreasData?.totalCosponsored ?? cosponsoredData?.count ?? 0).toLocaleString()} all-time`}{" "}
                        </Text>
                        {showFilterModal ? (
                          <ChevronUp
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        ) : (
                          <ChevronDown
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        )}
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          componentStyles.button,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                        ]}
                        onPress={() => setShowSortDropdown(!showSortDropdown)}
                      >
                        <Text style={componentStyles.sortText}>
                          {selectedSort}
                        </Text>
                        {showSortDropdown ? (
                          <ChevronUp
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        ) : (
                          <ChevronDown
                            size={24}
                            color="#535353"
                            style={{ marginRight: 24 }}
                          />
                        )}
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
        searchContext={activeTab === 1 ? "Sponsored" : "Cosponsored"}
        items={toSearchable(
          activeTab === 1 ? filteredSponsored : filteredCosponsored,
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
        selectedChambers={selectedChambers}
        selectedPolicyAreas={selectedPolicyAreas}
        selectedLegislationTypes={selectedLegislationTypes}
        toggleChamber={toggleChamber}
        togglePolicyArea={togglePolicyArea}
        toggleLegislationType={toggleLegislationType}
        onCancel={handleCancel}
        onApply={handleApply}
        setSelectedChambers={setSelectedChambers}
        setSelectedPolicyAreas={setSelectedPolicyAreas}
        setSelectedLegislationTypes={setSelectedLegislationTypes}
        resultCount={
          activeTab === 1
            ? filteredSponsored.length
            : filteredCosponsored.length
        }
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
          role:
            official.terms?.[0]?.chamber === "House of Representatives"
              ? `Representative, ${official.state}${official.terms?.[0]?.district ? ` - District ${official.terms[0].district}` : ""}`
              : `Senator, ${official.state}`,
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
    </View>
  );
}
