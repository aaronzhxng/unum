import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import { decode } from "html-entities";
import {
  Bell,
  BellOff,
  BellRing,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Copy,
  Plus,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Clipboard,
  Image,
  Linking,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import JargonFootnotes from "../../components/JargonFootnotes";
import AddModal from "../global_components/AddModal";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import { billsService } from "../services/bills";
import { billCache } from "../utils/billCache";
import { billCongressCache } from "../utils/billCongressCache";
import { getBillIcon } from "../utils/billIcons";
import { getDb } from "../utils/database";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { notificationPreferences } from "../utils/notificationPreferences";
import { syncPreferencesToBackend } from "../utils/syncPreferences";
import ActionHistory from "./bill_components/ActionHistory";
import Cosponsors from "./bill_components/Cosponsors";
import FilterDropdown from "./bill_components/FilterDropdown";
import OptionsModal from "./bill_components/OptionsModal";
import SortDropdown from "./bill_components/SortDropdown";
import VotingCard from "./bill_components/VotingCard";
import { styles as componentStyles } from "./styles";

import { storage } from "../utils/storage";

const TABS = ["details", "voting", "actions", "cosponsors"] as const;
type TabName = (typeof TABS)[number];

const STATE_NAMES: { [key: string]: string } = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export default function BillDetail() {
  // console.log("BillDetail render:", Date.now());
  const pagerRef = useRef<PagerView>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const congress = billCongressCache.get(id as string);
  const router = useRouter() as Router;
  // const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const [activeTab, setActiveTab] = useState<TabName>("details");
  const [activeIndex, setActiveIndex] = useState(0);

  // Lazy load tracking
  const [votingVisited, setVotingVisited] = useState(false);
  const [cosponsorsVisited, setCosponsorsVisited] = useState(false);
  const [actionsVisited, setActionsVisited] = useState(false);

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

  // const [showSearchModal, setShowSearchModal] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [showAmendments, setShowAmendments] = useState(false);
  const [showAmendmentsSort, setShowAmendmentsSort] = useState(false);
  const [selectedAmendmentsSort, setSelectedAmendmentsSort] =
    useState("Newest First");
  const [enrichedAmendments, setEnrichedAmendments] = useState<any[]>([]);
  const [loadingAmendments, setLoadingAmendments] = useState(false);
  const [amendmentOffset, setAmendmentOffset] = useState(0);
  const [selectedAmendmentChamber, setSelectedAmendmentChamber] = useState<
    string[]
  >([]);
  const [selectedAmendmentParty, setSelectedAmendmentParty] = useState<
    string[]
  >([]);
  const [showAmendmentChamberModal, setShowAmendmentChamberModal] =
    useState(false);
  const [showAmendmentPartyModal, setShowAmendmentPartyModal] = useState(false);

  const [isFiltered, setIsFiltered] = useState(false);
  const [showChamberModal, setShowChamberModal] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState(["Bills"]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState(["Congress"]);

  const [showActionsSort, setShowActionsSort] = useState(false);
  const [selectedActionsSort, setSelectedActionsSort] =
    useState("Newest First");

  const [showCosponsorFilter, setShowCosponsorFilter] = useState(false);
  const [showCosponsorSort, setShowCosponsorSort] = useState(false);
  const [selectedCosponsorSort, setSelectedCosponsorSort] =
    useState("Oldest First");
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [showCosponsorChamberModal, setShowCosponsorChamberModal] =
    useState(false);
  const [showCosponsorPartyModal, setShowCosponsorPartyModal] = useState(false);
  const [selectedCosponsorParty, setSelectedCosponsorParty] = useState<
    string[]
  >([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const billNotifId = `bill_${id}`;
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [notifVersion, setNotifVersion] = useState(0);
  const notifSubTypes = React.useMemo(
    () => notificationPreferences.getSubTypes(billNotifId),
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

  const followedOfficials = useMemo(() => {
    const db = getDb();
    const rows = db.getAllSync<{ item_id: string; name: string }>(
      `SELECT DISTINCT item_id, name FROM list_items WHERE item_type = 'official'`,
    );
    return rows.map((r) => ({
      bioguideId: r.item_id,
      name: r.name,
    }));
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
      listEvents.emit(LIST_UPDATED);
      setCreatedListName(newListName.trim());
      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
      setNewListProgress(0);
      setTimeout(() => setShowNewListProgressModal(true), 50);
    }
  };

  interface FilterOption {
    id: string;
    label: string;
  }

  const chamber: FilterOption[] = [
    { id: "house", label: "House" },
    { id: "senate", label: "Senate" },
  ];

  const party: FilterOption[] = [
    { id: "democrat", label: "Democrat" },
    { id: "republican", label: "Republican" },
    { id: "independent", label: "Independent" },
  ];

  // const cosponsorParties: FilterOption[] = [
  //   { id: "D", label: "Democrat" },
  //   { id: "R", label: "Republican" },
  //   { id: "I", label: "Independent" },
  // ];

  const toggleChamber = (type: string) => {
    setSelectedChamber((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleParty = (policy: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policy)
        ? prev.filter((p) => p !== policy)
        : [...prev, policy],
    );
  };

  const toggleCosponsorRole = (role: string) => {
    setSelectedRole((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const toggleCosponsorParty = (party: string) => {
    setSelectedCosponsorParty((prev) =>
      prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party],
    );
  };

  const toggleAmendmentChamber = (id: string) => {
    setSelectedAmendmentChamber((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleAmendmentParty = (id: string) => {
    setSelectedAmendmentParty((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleCancel = () => {
    setSelectedChamber(["Bills"]);
    setSelectedPolicies(["Congress"]);
    setShowChamberModal(false);
    setShowPartyModal(false);
  };

  const handleApply = () => {
    const hasFilters =
      selectedChamber.some((f) => f !== "Bills") ||
      selectedPolicies.some((p) => p !== "Congress");
    setIsFiltered(hasFilters);
    setShowChamberModal(false);
    setShowPartyModal(false);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["bill", id],
    queryFn: async () => {
      // console.log("queryFn start:", Date.now());
      const billId = id as string;
      const cacheKey = `${congress}-${billId}`;
      // console.log("checking cache:", Date.now());
      const cached = await billCache.getBill(cacheKey);
      // console.log("cache result:", cached ? "HIT" : "MISS", Date.now());
      if (cached) return { bill: cached };

      const billResult = await billsService.getById(billId, congress);
      if (!billResult?.bill) throw new Error("Bill not found");

      const [summariesResult, actionsResult, amendmentsResult] =
        await Promise.allSettled([
          billsService.getSummaries(billId, congress),
          billsService.getActions(billId, congress),
          billsService.getAmendments(billId, congress),
        ]);

      const summaries =
        summariesResult.status === "fulfilled"
          ? summariesResult.value.summaries
          : [];
      const actions =
        actionsResult.status === "fulfilled" ? actionsResult.value.actions : [];
      const amendments =
        amendmentsResult.status === "fulfilled"
          ? amendmentsResult.value.amendments
          : [];

      const enrichedBill = {
        ...billResult.bill,
        summaries: summaries || [],
        actions: actions || [],
        amendments: amendments || [],
      };

      await billCache.saveBill(cacheKey, enrichedBill);

      const lists = await storage.getLists();
      let updated = false;
      for (const list of lists) {
        for (const item of list.items) {
          if (item.id === billId && item.type === "bill") {
            (item as any).policyArea = enrichedBill.policyArea?.name;
            updated = true;
          }
        }
      }
      if (updated) await storage.saveLists(lists);

      return { bill: enrichedBill };
    },
    enabled: !!id,
    retry: 1,
    retryDelay: 1000,
  });

  const { data: votesData, isLoading: votesLoading } = useQuery({
    queryKey: ["billVotes", id],
    queryFn: () => billsService.getVotes(id as string, congress),
    enabled: !!id && votingVisited,
    retry: 1,
  });

  const { data: cosponsorsData, isLoading: cosponsorsLoading } = useQuery({
    queryKey: ["billCosponsors", id],
    queryFn: () => billsService.getCosponsors(id as string, congress),
    enabled: !!id && cosponsorsVisited,
    retry: 1,
  });

  const bill = data?.bill;

  useEffect(() => {
    if (!showNewListProgressModal) return;
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

  const parseAPIDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
  };

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

  const processedActions = useMemo(
    () =>
      Array.isArray(bill?.actions)
        ? bill.actions
            .filter((action: any) => {
              const source = action.sourceSystem?.name || "";
              const text = action.text?.toLowerCase() || "";
              if (!source.toLowerCase().includes("library of congress"))
                return true;
              return (
                text.includes("signed by president") ||
                text.includes("presented to president") ||
                text.includes("became public law") ||
                text.includes("vetoed by president") ||
                text.includes("enacted")
              );
            })
            .filter((action: any, index: number, arr: any[]) => {
              const key = `${action.actionDate}-${action.text}`;
              return (
                arr.findIndex((a) => `${a.actionDate}-${a.text}` === key) ===
                index
              );
            })
            .map((action: any) => {
              const source = action.sourceSystem?.name || "";
              let chamber = source;
              if (source.toLowerCase().includes("house")) chamber = "House";
              else if (source.toLowerCase().includes("senate"))
                chamber = "Senate";
              else chamber = "";
              return {
                date:
                  action.actionDate.split("-").slice(1).join("/") +
                  "/" +
                  action.actionDate.split("-")[0].slice(2),
                chamber,
                description: action.text,
              };
            })
        : [],
    [bill?.actions],
  );

  const sortedActions = useMemo(() => {
    const activeFilters = selectedChamber.filter((f) => f !== "Bills");
    const filteredActions =
      activeFilters.length === 0
        ? processedActions
        : processedActions.filter(
            (action: { chamber: string; date: string; description: string }) =>
              action.chamber === "" ||
              activeFilters.some(
                (f) => action.chamber.toLowerCase() === f.toLowerCase(),
              ),
          );
    return [...filteredActions].sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const [month, day, year] = dateStr.split("/");
        return new Date(
          parseInt("20" + year),
          parseInt(month) - 1,
          parseInt(day),
        ).getTime();
      };
      return selectedActionsSort === "Oldest First"
        ? parseDate(a.date) - parseDate(b.date)
        : parseDate(b.date) - parseDate(a.date);
    });
  }, [processedActions, selectedChamber, selectedActionsSort]);

  const sortedCosponsors = useMemo(() => {
    const mappedCosponsors = (cosponsorsData?.cosponsors ?? []).map(
      (c: any) => ({
        id: c.bioguideId,
        name: c.name,
        party: c.party,
        role: c.district
          ? `Rep, ${STATE_NAMES[c.state] || c.state} - ${c.district}`
          : `Senator, ${STATE_NAMES[c.state] || c.state}`,
        photoUrl: c.photoUrl,
        update: c.isOriginalCosponsor
          ? "Original cosponsor"
          : `Joined ${new Date(
              parseAPIDate(c.sponsorshipDate),
            ).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })}`,
        sponsorshipDate: parseAPIDate(c.sponsorshipDate),
        isOriginal: c.isOriginalCosponsor ?? false,
      }),
    );
    return [...mappedCosponsors].sort((a, b) => {
      switch (selectedCosponsorSort) {
        case "A-Z":
          return a.name.localeCompare(b.name);
        case "Z-A":
          return b.name.localeCompare(a.name);
        case "Newest First":
          if (a.sponsorshipDate !== b.sponsorshipDate)
            return b.sponsorshipDate - a.sponsorshipDate;
          return a.isOriginal === b.isOriginal ? 0 : a.isOriginal ? 1 : -1;
        case "Oldest First":
          if (a.sponsorshipDate !== b.sponsorshipDate)
            return a.sponsorshipDate - b.sponsorshipDate;
          return a.isOriginal === b.isOriginal ? 0 : a.isOriginal ? -1 : 1;
        default:
          return 0;
      }
    });
  }, [cosponsorsData?.cosponsors, selectedCosponsorSort]);

  const displayedAmendments = useMemo(
    () =>
      enrichedAmendments
        .filter((a: any) => {
          const chamberMatch =
            selectedAmendmentChamber.length === 0 ||
            (selectedAmendmentChamber.includes("house") &&
              a.type?.startsWith("H")) ||
            (selectedAmendmentChamber.includes("senate") &&
              a.type?.startsWith("S"));
          const partyMatch =
            selectedAmendmentParty.length === 0 ||
            (a.sponsors?.[0]?.party &&
              selectedAmendmentParty
                .map((p) => p.charAt(0).toUpperCase())
                .includes(a.sponsors[0].party));
          return chamberMatch && partyMatch;
        })
        .sort((a: any, b: any) => {
          const numA = parseInt(a.number || "0");
          const numB = parseInt(b.number || "0");
          return selectedAmendmentsSort === "Oldest First"
            ? numA - numB
            : numB - numA;
        }),
    [
      enrichedAmendments,
      selectedAmendmentChamber,
      selectedAmendmentParty,
      selectedAmendmentsSort,
    ],
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          {`Loading ${(id as string).toUpperCase()}...`}
        </Text>
      </View>
    );
  }

  if (error || !bill) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading bill</Text>
      </View>
    );
  }

  const getBillTypeName = (typeCode: string, chamber: string) => {
    const types: { [key: string]: string } = {
      HR: "House Bill",
      HRES: "House Simple Resolution",
      HJRES: "House Joint Resolution",
      HCONRES: "House Concurrent Resolution",
      S: "Senate Bill",
      SRES: "Senate Simple Resolution",
      SJRES: "Senate Joint Resolution",
      SCONRES: "Senate Concurrent Resolution",
      PN: "Nomination",
      TREATY: "Treaty Document",
    };
    return types[typeCode.toUpperCase()] || `${chamber} Bill`;
  };

  const fetchAmendmentDetails = async (offset = 0) => {
    if (!bill.amendments || bill.amendments.length === 0) return;
    if (offset === 0 && enrichedAmendments.length > 0) return;
    setLoadingAmendments(true);
    try {
      const sortedAmendments = [...bill.amendments].sort((a: any, b: any) => {
        return parseInt(b.number || "0") - parseInt(a.number || "0");
      });
      const amendmentsToFetch = sortedAmendments.slice(offset, offset + 20);
      const detailsPromises = amendmentsToFetch.map((amendment: any) =>
        billsService
          .getAmendmentDetails(amendment.type.toLowerCase(), amendment.number)
          .catch(() => null),
      );
      const results = await Promise.all(detailsPromises);
      const enriched = results
        .filter((r) => r?.amendment)
        .map((r) => r.amendment);
      setEnrichedAmendments((prev) =>
        offset === 0 ? enriched : [...prev, ...enriched],
      );
      setAmendmentOffset(offset + 20);
    } catch (error) {
      console.error("Error fetching amendment details:", error);
    } finally {
      setLoadingAmendments(false);
    }
  };

  const formatAmendmentNumber = (type: string, number: string) => {
    const formattedType = type
      .replace("SAMDT", "S.Amdt.")
      .replace("HAMDT", "HR.Amdt.");
    return `${formattedType}${number}`;
  };

  // if (isNavigatingBack) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <LoadingSpinner />
  //     </View>
  //   );
  // }

  // console.log("BillDetail rendering UI:", Date.now());

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

      {/* Bill Header - fixed above tabs */}
      <View style={componentStyles.centeredRow}>
        <View
          style={[
            componentStyles.avatarBill,
            {
              backgroundColor: "#eee",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {bill.policyArea?.name ? (
            <Image
              source={getBillIcon(bill.policyArea.name)}
              style={{ width: "100%", height: "100%", borderRadius: 6 }}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#535353" }}
            >
              {bill.type}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[componentStyles.metaRow, { flexWrap: "nowrap" }]}>
            <Text style={[componentStyles.subtitle, { flexShrink: 0 }]}>
              {(() => {
                const [y, m, d] = bill.latestAction.actionDate
                  .split("-")
                  .map(Number);
                return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                });
              })()}
            </Text>
            {bill.policyArea?.name && (
              <>
                <Text style={componentStyles.separator}>·</Text>
                <Text
                  style={[componentStyles.subtitle, { flexShrink: 1 }]}
                  numberOfLines={1}
                >
                  {bill.policyArea.name}
                </Text>
              </>
            )}
          </View>
          <Text style={componentStyles.billNumber}>
            {bill.type}.{bill.number} - {bill.title}
          </Text>
        </View>
      </View>

      {/* Tab Bar - fixed */}
      <View style={componentStyles.tabsNegative}>
        <View style={componentStyles.tabs}>
          {(["Details", "Voting", "Actions", "Cosponsors"] as const).map(
            (label, index) => (
              <Pressable
                key={label}
                onPress={() => {
                  setActiveIndex(index);
                  setActiveTab(TABS[index]);
                  pagerRef.current?.setPage(index);
                  if (index === 1) setVotingVisited(true);
                  if (index === 2) setActionsVisited(true);
                  if (index === 3) setCosponsorsVisited(true);
                }}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <Text
                  style={[
                    componentStyles.tab,
                    activeIndex === index && componentStyles.tabActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </View>

      {/* PagerView */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          setActiveIndex(index);
          setActiveTab(TABS[index]);
          if (index === 1) setVotingVisited(true);
          if (index === 2) setActionsVisited(true);
          if (index === 3) setCosponsorsVisited(true);
        }}
      >
        {/* Page 0: Details */}
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
            <View style={componentStyles.details}>
              <View style={{ flex: 1, flexDirection: "column" }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text style={componentStyles.detailTitle}>Status: </Text>
                  <Text style={componentStyles.status}>
                    {bill.latestAction?.text || "Introduced"}
                  </Text>
                </View>
                <View style={{ marginLeft: 8 }}>
                  <JargonFootnotes text={bill.latestAction?.text} />
                </View>
              </View>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Latest Action: </Text>
              <Text style={componentStyles.detailInfo}>
                {(() => {
                  const [y, m, d] = bill.latestAction.actionDate
                    .split("-")
                    .map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  });
                })()}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Introduced: </Text>
              <Text style={componentStyles.detailInfo}>
                {safeFormatDate(bill.introducedDate)}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Policy Area: </Text>
              <Text style={componentStyles.detailInfo}>
                {bill.policyArea?.name || "N/A"}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Type: </Text>
              <Text style={componentStyles.detailInfo}>
                {getBillTypeName(bill.type, bill.originChamber)}
              </Text>
            </View>

            {/* Sponsor Card */}
            <View style={{ marginBottom: 8 }}>
              <Text
                style={[
                  componentStyles.detailTitle,
                  { marginBottom: 8, marginHorizontal: 20 },
                ]}
              >
                Sponsor:
              </Text>
              {data?.bill?.sponsors?.[0] ? (
                <SponsorCard sponsor={data.bill.sponsors[0]} />
              ) : (
                <View style={componentStyles.details}>
                  <Text style={componentStyles.detailInfo}>Not available</Text>
                </View>
              )}
            </View>

            {/* Summary */}
            <View style={componentStyles.section}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={componentStyles.detailTitle}>Summary</Text>
                {bill.summaries && bill.summaries.length > 0 && (
                  <Pressable
                    onPress={() => {
                      const text = decode(
                        bill.summaries[0].text.replace(/<[^>]*>/g, ""),
                      );
                      Clipboard.setString(text);
                    }}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.75 : 1 }],
                      padding: 4,
                    })}
                  >
                    <Copy size={16} color="#7B7C81" />
                  </Pressable>
                )}
              </View>
              {bill.summaries && bill.summaries.length > 0 ? (
                <>
                  <Text style={componentStyles.summary}>
                    {decode(
                      bill.summaries[0].text.replace(/<[^>]*>/g, ""),
                    ).replace(
                      /([A-Z][^.!?]*(?:Act|Resolution|Bill)(?: of \d{4})?)\s*(This|The|A |An )/,
                      "$1\n\n$2",
                    )}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#7B7C81", marginTop: 8 }}
                  >
                    {bill.summaries[0].actionDesc} • Last updated:{" "}
                    {safeFormatDate(
                      bill.summaries[0].updateDate?.split("T")[0],
                    )}{" "}
                  </Text>
                  <JargonFootnotes
                    text={bill.summaries?.[0]?.text?.replace(/<[^>]*>/g, "")}
                  />
                </>
              ) : (
                <Text style={componentStyles.summary}>
                  No summary available yet. This bill may be too new or Congress
                  hasn't published a summary. Check back later or view the full
                  text on Congress.gov.
                </Text>
              )}
              <Pressable
                onPress={() => {
                  const url = `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.originChamber?.toLowerCase() === "house" ? "house" : "senate"}-bill/${bill.number}`;
                  Linking.openURL(url);
                }}
                style={{
                  flexDirection: "row",
                  gap: 4,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#7B7C81",
                  padding: 6,
                  paddingHorizontal: 8,
                  borderRadius: 24,
                  alignSelf: "flex-start",
                  marginTop: 12,
                }}
              >
                <Text style={componentStyles.link}>View on congress.gov</Text>
              </Pressable>
            </View>

            {/* Amendments */}
            <View
              style={[componentStyles.amendmentsSection, { marginBottom: 96 }]}
            >
              <Pressable
                style={[
                  componentStyles.sectionHeader,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => {
                  setShowAmendments(!showAmendments);
                  if (!showAmendments) fetchAmendmentDetails(0);
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ alignSelf: "flex-start", height: 20 }}>
                    {!showAmendments ? (
                      <Text
                        style={[
                          componentStyles.detailTitle,
                          { lineHeight: 20 },
                        ]}
                      >
                        Amendments ({bill.amendments?.length || 0})
                      </Text>
                    ) : (
                      <Pressable
                        style={({ pressed }) => [
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            flex: 1,
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                          },
                        ]}
                        onPress={() => {
                          setShowAmendmentChamberModal(true);
                          setShowAmendmentPartyModal(false);
                        }}
                      >
                        <Text
                          style={[
                            componentStyles.detailTitle,
                            { lineHeight: 16 },
                          ]}
                        >
                          Amendments ({displayedAmendments.length})
                        </Text>
                        {showAmendmentChamberModal ? (
                          <ChevronUp size={16} color="#7B7C81" />
                        ) : (
                          <ChevronDown size={16} color="#7B7C81" />
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>

                {showAmendments && (
                  <Pressable
                    style={({ pressed }) => [
                      componentStyles.button,
                      { transform: [{ scale: pressed ? 0.96 : 1 }] },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowAmendmentsSort(!showAmendmentsSort);
                    }}
                  >
                    <Text style={componentStyles.viewAll}>
                      {selectedAmendmentsSort}
                    </Text>
                    {showAmendmentsSort ? (
                      <ChevronUp size={16} color="#7B7C81" />
                    ) : (
                      <ChevronDown size={16} color="#7B7C81" />
                    )}
                  </Pressable>
                )}

                <View
                  style={{
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  pointerEvents={showAmendments ? "auto" : "none"}
                >
                  {showAmendments ? (
                    <Pressable
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => setShowAmendments(false)}
                      style={{ position: "absolute" }}
                    >
                      <ChevronUp size={20} color="#7B7C81" />
                    </Pressable>
                  ) : (
                    <ChevronDown size={20} color="#7B7C81" />
                  )}
                </View>
              </Pressable>

              {showAmendments && (
                <View style={componentStyles.expandedAmendments}>
                  {enrichedAmendments.length > 0 ? (
                    <>
                      {displayedAmendments.map(
                        (amendment: any, index: number) => (
                          <View
                            key={amendment.number || index}
                            style={componentStyles.amendmentItem}
                          >
                            <View
                              style={componentStyles.amendmentTitleandSponsor}
                            >
                              <Text style={componentStyles.detailTitle}>
                                {formatAmendmentNumber(
                                  amendment.type,
                                  amendment.number,
                                )}
                                {amendment.amendedAmendment && (
                                  <Text style={{ fontWeight: "400" }}>
                                    {" to "}
                                    {formatAmendmentNumber(
                                      amendment.amendedAmendment.type,
                                      amendment.amendedAmendment.number,
                                    )}
                                  </Text>
                                )}
                              </Text>
                              {amendment.sponsors && amendment.sponsors[0] && (
                                <Text style={componentStyles.amendmentSponsor}>
                                  {`${amendment.sponsors[0].firstName || ""} ${amendment.sponsors[0].lastName || ""} [${amendment.sponsors[0].party || "?"}-${amendment.sponsors[0].state || "?"}]`}
                                </Text>
                              )}
                            </View>
                            <Text style={componentStyles.amendmentSummary}>
                              {safeFormatDate(amendment.submittedDate) ||
                                "Date unavailable. "}
                              {amendment.purpose ||
                                amendment.amendedAmendment?.purpose ||
                                "Description not yet available"}
                            </Text>
                            {amendment.latestAction?.text && (
                              <Text
                                style={[
                                  componentStyles.amendmentSummary,
                                  {
                                    fontWeight: "500",
                                    color: "#000",
                                    marginTop: 4,
                                  },
                                ]}
                              >
                                {amendment.latestAction.text}
                              </Text>
                            )}
                          </View>
                        ),
                      )}
                      {enrichedAmendments.length < bill.amendments.length && (
                        <Pressable
                          onPress={() => fetchAmendmentDetails(amendmentOffset)}
                        >
                          <Text
                            style={{
                              color: "#008CFF",
                              textAlign: "center",
                              padding: 16,
                            }}
                          >
                            Load More (
                            {bill.amendments.length - enrichedAmendments.length}{" "}
                            remaining)
                          </Text>
                        </Pressable>
                      )}
                      {loadingAmendments && (
                        <Text
                          style={{
                            textAlign: "center",
                            padding: 12,
                            color: "#7B7C81",
                          }}
                        >
                          Loading more...
                        </Text>
                      )}
                    </>
                  ) : loadingAmendments ? (
                    <Text
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#7B7C81",
                      }}
                    >
                      Loading amendment details...
                    </Text>
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#7B7C81",
                      }}
                    >
                      No amendments available
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Page 1: Voting */}
        <View key="1" style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingTop: 1 }}
          >
            <View style={{ marginBottom: 96 }}>
              {votingVisited && (
                <VotingCard
                  votes={votesData?.votes ?? []}
                  isLoading={votesLoading}
                  followedOfficials={followedOfficials}
                />
              )}
            </View>
          </ScrollView>
        </View>

        {/* Page 2: Actions */}
        <View key="2" style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {actionsVisited && (
              <ActionHistory
                actions={sortedActions}
                selectedSort={selectedActionsSort}
                showSort={showActionsSort}
                setShowSort={setShowActionsSort}
                showChamberModal={showChamberModal}
                showPartyModal={showPartyModal}
                setShowChamberModal={setShowChamberModal}
                setShowPartyModal={setShowPartyModal}
                showOnlyChamber={true}
                chamberLabelOverride="Chamber of Origin"
              />
            )}
          </ScrollView>
        </View>

        {/* Page 3: Cosponsors */}
        <View key="3" style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ marginBottom: 96, marginHorizontal: 16 }}>
              {cosponsorsVisited && (
                <Cosponsors
                  cosponsors={sortedCosponsors}
                  isLoading={cosponsorsLoading}
                  showCosponsorFilter={showCosponsorFilter}
                  setShowCosponsorFilter={setShowCosponsorFilter}
                  showCosponsorSort={showCosponsorSort}
                  setShowCosponsorSort={setShowCosponsorSort}
                  selectedCosponsorSort={selectedCosponsorSort}
                  showCosponsorChamberModal={showCosponsorChamberModal}
                  showCosponsorPartyModal={showCosponsorPartyModal}
                  setShowCosponsorChamberModal={setShowCosponsorChamberModal}
                  setShowCosponsorPartyModal={setShowCosponsorPartyModal}
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                  selectedParty={selectedCosponsorParty}
                  setSelectedParty={setSelectedCosponsorParty}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </PagerView>

      {/* Modals - outside PagerView */}
      <SortDropdown
        showSortDropdown={showAmendmentsSort}
        setShowSortDropdown={setShowAmendmentsSort}
        selectedSort={selectedAmendmentsSort}
        setSelectedSort={setSelectedAmendmentsSort}
        dropdownType="amendments"
      />
      <FilterDropdown
        showChamberModal={showAmendmentChamberModal}
        showPartyModal={showAmendmentPartyModal}
        selectedChamber={selectedAmendmentChamber}
        selectedPolicies={selectedAmendmentParty}
        toggleChamber={toggleAmendmentChamber}
        toggleParty={toggleAmendmentParty}
        setShowChamberModal={setShowAmendmentChamberModal}
        setShowPartyModal={setShowAmendmentPartyModal}
        chamber={chamber}
        party={party}
        showOnlyChamber={false}
        chamberLabelOverride="Chamber of Origin"
        showMilestoneNote={false}
        onCancel={() => {
          setSelectedAmendmentChamber([]);
          setSelectedAmendmentParty([]);
          setShowAmendmentChamberModal(false);
        }}
        onApply={() => setShowAmendmentChamberModal(false)}
      />
      <SortDropdown
        showSortDropdown={showActionsSort}
        setShowSortDropdown={setShowActionsSort}
        selectedSort={selectedActionsSort}
        setSelectedSort={setSelectedActionsSort}
        dropdownType="actions"
      />
      <FilterDropdown
        showChamberModal={showChamberModal}
        showPartyModal={showPartyModal}
        selectedChamber={selectedChamber}
        selectedPolicies={selectedPolicies}
        toggleChamber={toggleChamber}
        toggleParty={toggleParty}
        setShowChamberModal={setShowChamberModal}
        setShowPartyModal={setShowPartyModal}
        onCancel={handleCancel}
        onApply={handleApply}
        chamber={chamber}
        party={party}
        showOnlyChamber={true}
        chamberLabelOverride="Chamber of Origin"
        showMilestoneNote={true}
      />
      <SortDropdown
        showSortDropdown={showCosponsorSort}
        setShowSortDropdown={setShowCosponsorSort}
        selectedSort={selectedCosponsorSort}
        setSelectedSort={setSelectedCosponsorSort}
        dropdownType="cosponsors"
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
        currentItem={
          bill
            ? {
                id: `${bill.type.toLowerCase()}${bill.number}`,
                type: "bill",
                name: `${bill.type}.${bill.number} - ${bill.title}`,
                date: bill.latestAction?.actionDate,
                latestAction: bill.latestAction?.text,
                policyArea: bill.policyArea?.name,
              }
            : undefined
        }
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
        itemId={billNotifId}
        itemType="bill"
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
                if (newlyCreatedList)
                  await storage.deleteList(newlyCreatedList.id);
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

  function SponsorCard({ sponsor }: { sponsor: any }) {
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    const photoUrl = sponsor.bioguideId
      ? `https://bioguide.congress.gov/bioguide/photo/${sponsor.bioguideId[0]}/${sponsor.bioguideId}.jpg`
      : null;

    const role = sponsor.district
      ? `Representative, ${STATE_NAMES[sponsor.state] ?? sponsor.state}, District ${sponsor.district}`
      : `Senator, ${STATE_NAMES[sponsor.state] ?? sponsor.state}`;

    return (
      <Pressable
        onPress={() =>
          sponsor.bioguideId &&
          router.navigate(`/official/${sponsor.bioguideId}`)
        }
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <View style={[componentStyles.officialCard, { marginHorizontal: 16 }]}>
          <View style={componentStyles.avatar}>
            {photoUrl && !imageError ? (
              <Image
                source={{ uri: photoUrl }}
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
                  {sponsor.fullName?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.name}>
              {sponsor.firstName} {sponsor.lastName}
            </Text>
            <View style={componentStyles.metaRow}>
              {sponsor.party ? (
                <>
                  <Text style={componentStyles.subtitle}>{sponsor.party}</Text>
                  <Text style={componentStyles.separator}>·</Text>
                </>
              ) : null}
              <Text style={componentStyles.subtitle}>{role}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }
}
