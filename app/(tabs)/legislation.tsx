import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
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
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import { usePolicyAreas } from "../context/PolicyAreasContext";
import { useTabBar } from "../context/TabBarContext";
import AddModal from "../global_components/AddModal";
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LegislationOptionsModal from "../global_components/LegislationOptionsModal";
import SortDropdown from "../global_components/LegislationSortDropdown";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import { billsService } from "../services/bills";
import { billCache } from "../utils/billCache";
import { billCongressCache } from "../utils/billCongressCache";
import { getBillIcon } from "../utils/billIcons";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { storage } from "../utils/storage";

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface FilterOption {
  id: string;
  label: string;
}

type Bill = {
  id: string;
  name: string;
  date: string;
  status: string;
  committee: string;
  avatar?: any;
};

export default function LegislationScreen() {
  // const navigation = useNavigation();
  const { setTabBarHidden } = useTabBar();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFallbackResults, setSearchFallbackResults] = useState<any[]>([]);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] =
    useState("Congress");

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recent Action");

  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const [enrichedBills, setEnrichedBills] = useState<{ [key: string]: any }>(
    {},
  );
  const policyAreas = usePolicyAreas();

  // Tracks which bill IDs have already been fetched this session
  // so we never fire duplicate requests as the user scrolls back up
  const fetchedIds = useRef<Set<string>>(new Set());

  // Queue of bill IDs visible on screen waiting to be fetched
  const fetchQueue = useRef<string[]>([]);
  const isFetching = useRef(false);

  const handleReportError = () => {};

  const handleNewListCreate = async (listName?: string) => {
    const name = listName ?? newListName;
    if (name.trim()) {
      const allLists = storage.getLists();

      const itemToSave = pendingItemForNewList
        ? {
            id:
              pendingItemForNewList.id ??
              (pendingItemForNewList.billType && pendingItemForNewList.number
                ? `${pendingItemForNewList.billType.toLowerCase()}${pendingItemForNewList.number}`
                : `${pendingItemForNewList.type?.toLowerCase()}${pendingItemForNewList.number}`),
            type: "bill" as const,
            name:
              pendingItemForNewList.name ??
              `${pendingItemForNewList.billType ?? pendingItemForNewList.type}.${pendingItemForNewList.number} - ${pendingItemForNewList.title}`,
            date:
              pendingItemForNewList.date ??
              pendingItemForNewList.latestAction?.actionDate,
            latestAction:
              typeof pendingItemForNewList.latestAction === "string"
                ? pendingItemForNewList.latestAction
                : pendingItemForNewList.latestAction?.text,
            policyArea:
              pendingItemForNewList.policyArea?.name ??
              pendingItemForNewList.policyArea,
            update: "",
          }
        : null;

      const newList = {
        id: Date.now().toString(),
        name: name.trim(),
        items: itemToSave ? [itemToSave] : [],
      };

      allLists.push(newList);
      storage.saveLists(allLists);
      listEvents.emit(LIST_UPDATED);
      setCreatedListName(name.trim());
      setShowNewListProgressModal(true);
      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
    }
  };

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedChambers, setSelectedChambers] = useState<string[]>([]);
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<string[]>([]);
  const [selectedLegislationTypes, setSelectedLegislationTypes] = useState<
    string[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState("Congress");
  const debouncedChambers = useDebounced(selectedChambers, 300);
  const debouncedPolicyAreas = useDebounced(selectedPolicyAreas, 300);
  const debouncedLegislationTypes = useDebounced(selectedLegislationTypes, 300);
  const [isFiltering, setIsFiltering] = useState(false);
  const [pendingChambers, setPendingChambers] = useState<string[]>([]);
  const [pendingPolicyAreas, setPendingPolicyAreas] = useState<string[]>([]);
  const [pendingLegislationTypes, setPendingLegislationTypes] = useState<
    string[]
  >([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);
  const [listsVersion, setListsVersion] = useState(0);

  const getFilterLabel = () => {
    if (selectedChambers.length === 1) {
      const chamber = selectedChambers[0];
      if (chamber === "house") return "House";
      if (chamber === "senate") return "Senate";
    }
    return "Congress";
  };

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

  const handleFilterCancel = () => {
    setPendingChambers(selectedChambers);
    setPendingPolicyAreas(selectedPolicyAreas);
    setPendingLegislationTypes(selectedLegislationTypes);
    setShowFilterModal(false);
  };
  const handleFilterApply = () => {
    setShowFilterModal(false);
    setIsFiltering(true);
    setSelectedChambers(pendingChambers);
    setSelectedPolicyAreas(pendingPolicyAreas);
    setSelectedLegislationTypes(pendingLegislationTypes);
  };
  const handleFilterOpen = () => {
    setPendingChambers(selectedChambers);
    setPendingPolicyAreas(selectedPolicyAreas);
    setPendingLegislationTypes(selectedLegislationTypes);
    setShowSortDropdown(false);
    setShowFilterModal(true);
  };

  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bills"],
    queryFn: billsService.getAll,
  });

  const allBills: any[] = useMemo(() => {
    const bills = data?.bills || [];
    if (Object.keys(policyAreas).length === 0) return bills;
    return bills.map((bill) => ({
      ...bill,
      _policyArea:
        policyAreas[`${bill.type.toLowerCase()}${bill.number}`] ?? null,
      _introducedDate:
        policyAreas[`${bill.type.toLowerCase()}${bill.number}`] !== undefined
          ? (enrichedBills[`${bill.type.toLowerCase()}${bill.number}`]
              ?.introducedDate ??
            bill.updateDate ??
            null)
          : (bill.updateDate ?? null),
    }));
  }, [data?.bills, policyAreas]);

  const pendingCount = useMemo(() => {
    let filtered = allBills;

    if (pendingChambers.length > 0) {
      filtered = filtered.filter((bill) =>
        pendingChambers.some((chamber) => {
          if (chamber === "house") return bill.originChamber === "House";
          if (chamber === "senate") return bill.originChamber === "Senate";
          return false;
        }),
      );
    }

    if (pendingPolicyAreas.length > 0) {
      filtered = filtered.filter((bill) => {
        if (!bill._policyArea) return pendingPolicyAreas.includes("none");
        return pendingPolicyAreas.includes(bill._policyArea);
      });
    }

    if (
      pendingLegislationTypes.length > 0 &&
      !pendingLegislationTypes.includes("all")
    ) {
      const typeMap: { [key: string]: string[] } = {
        bill: ["HR", "S"],
        joint_resolution: ["HJRES", "SJRES"],
        concurrent_resolution: ["HCONRES", "SCONRES"],
        resolution: ["HRES", "SRES"],
        amendment: ["HAMDT", "SAMDT"],
        nomination: ["PN"],
        treaty: ["TREATY"],
      };
      const apiTypes = pendingLegislationTypes.flatMap(
        (id) => typeMap[id] || [],
      );
      filtered = filtered.filter((bill) => apiTypes.includes(bill.type));
    }

    return filtered.length;
  }, [allBills, pendingChambers, pendingPolicyAreas, pendingLegislationTypes]);

  const bills = useMemo(() => {
    let filtered: any[] = allBills.map((bill) => ({
      ...bill,
      _introducedDate:
        enrichedBills[`${bill.type.toLowerCase()}${bill.number}`]
          ?.introducedDate ??
        bill.updateDate ??
        null,
    }));

    if (debouncedChambers.length > 0) {
      filtered = filtered.filter((bill) =>
        debouncedChambers.some((chamber) => {
          if (chamber === "house")
            return (bill as any).originChamber === "House";
          if (chamber === "senate")
            return (bill as any).originChamber === "Senate";
          return false;
        }),
      );
    }
    if (debouncedPolicyAreas.length > 0) {
      filtered = filtered.filter((bill) => {
        if (!bill._policyArea) {
          return debouncedPolicyAreas.includes("none");
        }
        return debouncedPolicyAreas.includes(bill._policyArea);
      });
    }
    if (
      debouncedLegislationTypes.length > 0 &&
      !debouncedLegislationTypes.includes("all")
    ) {
      const typeMap: { [key: string]: string[] } = {
        bill: ["HR", "S"],
        joint_resolution: ["HJRES", "SJRES"],
        concurrent_resolution: ["HCONRES", "SCONRES"],
        resolution: ["HRES", "SRES"],
        amendment: ["HAMDT", "SAMDT"],
        nomination: ["PN"],
        treaty: ["TREATY"],
      };

      const apiTypes = debouncedLegislationTypes.flatMap(
        (id) => typeMap[id] || [],
      );

      filtered = filtered.filter((bill) =>
        apiTypes.includes((bill as any).type),
      );
    }

    let sorted = [...filtered];
    if (selectedSort === "Recent Action") {
      sorted.sort(
        (a, b) =>
          new Date((b as any).latestAction?.actionDate ?? 0).getTime() -
          new Date((a as any).latestAction?.actionDate ?? 0).getTime(),
      );
    } else if (selectedSort === "Oldest Action") {
      sorted.sort(
        (a, b) =>
          new Date(a.latestAction?.actionDate ?? 0).getTime() -
          new Date(b.latestAction?.actionDate ?? 0).getTime(),
      );
    }
    return sorted;
  }, [
    allBills,
    enrichedBills,
    debouncedChambers,
    debouncedPolicyAreas,
    debouncedLegislationTypes,
    selectedSort,
  ]);

  // ─── On mount: load SQLite cache for all bills instantly ──────────────────
  useEffect(() => {
    const rawBills = data?.bills || [];
    if (rawBills.length === 0) return;

    const enriched: { [key: string]: any } = {};
    for (const bill of rawBills) {
      const billId = `${bill.type.toLowerCase()}${bill.number}`;
      const cached = billCache.getBill(billId);
      if (cached?.policyArea) {
        enriched[billId] = cached;
        fetchedIds.current.add(billId);
      }
    }
    setEnrichedBills(enriched);
  }, [data?.bills]);

  // ─── Fetch queue processor ────────────────────────────────────────────────
  // Drains the queue of visible bill IDs that need fetching, one at a time.
  const processFetchQueue = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    while (fetchQueue.current.length > 0) {
      const billId = fetchQueue.current.shift()!;

      // Double-check it hasn't been fetched while waiting in queue
      if (fetchedIds.current.has(billId)) continue;
      fetchedIds.current.add(billId);

      // Find the bill to get its congress number
      const bill = bills.find(
        (b) => `${b.type.toLowerCase()}${b.number}` === billId,
      );
      if (!bill) continue;

      try {
        const detail = await billsService.getById(billId, bill.congress);
        const billData = detail?.bill ?? detail;

        if (billData?.policyArea) {
          billCache.saveBill(billId, billData);
          setEnrichedBills((prev) => ({ ...prev, [billId]: billData }));
        }
      } catch {
        // Silent fail — icon stays as letter placeholder
      }

      // Small pause between fetches to be polite to the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    isFetching.current = false;
  }, [bills]);

  const processFetchQueueRef = useRef(processFetchQueue);
  useEffect(() => {
    processFetchQueueRef.current = processFetchQueue;
  }, [processFetchQueue]);

  // ─── viewabilityConfig: item must be 50% visible to count ────────────────
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  // ─── onViewableItemsChanged: fires as user scrolls ───────────────────────
  const onViewableItemsChangedRef = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      // Prioritize visible items by putting them at the FRONT of the queue
      for (const { item } of viewableItems) {
        const billId = `${item.type.toLowerCase()}${item.number}`;
        if (fetchedIds.current.has(billId)) continue;
        if (fetchQueue.current.includes(billId)) {
          // Move to front if already queued
          fetchQueue.current = fetchQueue.current.filter((id) => id !== billId);
        }
        fetchQueue.current.unshift(billId); // front of queue
      }
      processFetchQueueRef.current();
    },
  );

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchFallbackResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const results = await billsService.search(searchQuery);
        if (results?.bills?.length > 0) {
          setSearchFallbackResults(results.bills);
        }
      } catch (e) {
        // silently fail
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const currentBill = bills.find(
    (b) => `${b.type.toLowerCase()}${b.number}` === currentBillId,
  );

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
    setTabBarHidden(showSearchModal);
  }, [showSearchModal]);

  useEffect(() => {
    const handler = () => setListsVersion((v) => v + 1);
    listEvents.on(LIST_UPDATED, handler);
    return () => {
      listEvents.removeListener(LIST_UPDATED, handler);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const rawBills = data?.bills || [];
      if (rawBills.length === 0) return;

      const enriched: { [key: string]: any } = {};
      for (const bill of rawBills) {
        const billId = `${bill.type.toLowerCase()}${bill.number}`;
        const cached = billCache.getBill(billId);
        if (cached?.policyArea) {
          enriched[billId] = cached;
          fetchedIds.current.add(billId);
        }
      }
      setEnrichedBills((prev) => ({ ...prev, ...enriched }));
    }, [data?.bills]),
  );

  useEffect(() => {
    const rawBills = data?.bills || [];
    if (rawBills.length === 0) return;

    for (const bill of rawBills.slice(0, 10)) {
      const billId = `${bill.type.toLowerCase()}${bill.number}`;
      if (fetchedIds.current.has(billId) || fetchQueue.current.includes(billId))
        continue;
      fetchQueue.current.push(billId);
    }
    processFetchQueue();
  }, [data?.bills]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setIsFiltering(true);
      const timer = setTimeout(() => setIsFiltering(false), 2250);
      return () => clearTimeout(timer);
    }, 50);
    return () => clearTimeout(delay);
  }, [selectedChambers, selectedPolicyAreas, selectedLegislationTypes]);

  useEffect(() => {
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [selectedSort]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          Loading bills...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#7B7C81" }}>
          Something went wrong. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={componentStyles.container}>
      {/* Header */}
      <View style={componentStyles.headerBar}>
        <View style={componentStyles.headerLeft}>
          <Pressable
            onPress={() => {
              setShowSortDropdown(false);
              handleFilterOpen();
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={[componentStyles.header, { alignItems: "center" }]}>
                {getFilterLabel()}
              </Text>
              {showFilterModal ? (
                <ChevronUp
                  size={24}
                  color="#535353"
                  style={{ marginBottom: 12 }}
                />
              ) : (
                <ChevronDown
                  size={24}
                  color="#535353"
                  style={{ marginBottom: 12 }}
                />
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              setShowFilterModal(false);
              setShowSortDropdown(!showSortDropdown);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              marginLeft: 12,
            })}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text
                style={[
                  componentStyles.header,
                  { fontSize: 16, fontWeight: 500 },
                ]}
              >
                {selectedSort}
              </Text>
              {showSortDropdown ? (
                <ChevronUp
                  size={20}
                  color="#535353"
                  style={{ marginBottom: 12 }}
                />
              ) : (
                <ChevronDown
                  size={20}
                  color="#535353"
                  style={{ marginBottom: 12 }}
                />
              )}
            </View>
          </Pressable>
        </View>

        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => setShowSearchModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Search size={24} color="#535353" />
          </Pressable>
          <Pressable
            onPress={() => setShowOptionsModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>

      {isFiltering ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: -86,
          }}
        >
          <LoadingSpinner />
          <Text style={{ color: "#7B7C81", marginTop: 24 }}>
            Loading bills...
          </Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => `${item.type}${item.number}`}
          contentContainerStyle={componentStyles.listContent}
          renderItem={({ item }) => {
            const billId = `${item.type.toLowerCase()}${item.number}`;
            return (
              <BillCard
                item={item}
                onAddPress={(id) => {
                  setCurrentBillId(id);
                  setShowAddModal(true);
                }}
                enrichedData={enrichedBills[billId]}
              />
            );
          }}
          onViewableItemsChanged={onViewableItemsChangedRef.current}
          viewabilityConfig={viewabilityConfig.current}
          directionalLockEnabled={true}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedFilter}
        items={[
          ...bills.map((item: any) => ({
            ...item,
            type: "bill",
            billType: item.type,
            name: `${item.type}.${item.number} - ${item.title}`,
            title: undefined,
            date: item.latestAction?.actionDate,
            policyArea:
              enrichedBills[`${item.type.toLowerCase()}${item.number}`]
                ?.policyArea?.name ??
              item.policyArea?.name ??
              null,
            latestAction: (item.latestAction as any)?.text ?? item.latestAction,
          })),
          ...searchFallbackResults
            .filter(
              (b: any) =>
                !bills.some(
                  (existing: any) =>
                    `${existing.type}${existing.number}` ===
                    `${b.type}${b.number}`,
                ),
            )
            .map((item: any) => {
              const billType = item.type ?? item.billType;
              const billNumber = item.number;
              const billTitle = item.title;
              const actionDate = item.latestAction?.actionDate;
              const actionText = item.latestAction?.text;
              const policyArea =
                item.policyArea?.name ?? item.policyArea ?? null;

              return {
                ...item,
                type: "bill",
                billType,
                name: `${billType}.${billNumber} - ${billTitle}`,
                title: undefined,
                date: actionDate,
                policyArea,
                latestAction: actionText ?? null,
                congress: item.congress ?? 119,
              };
            }),
        ]}
        onItemPress={(item) => {
          billCongressCache.set(
            `${item.billType.toLowerCase()}${item.number}`,
            item.congress,
          );
          router.navigate(`/bill/${item.billType.toLowerCase()}${item.number}`);
        }}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
      />

      <LegislationOptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        onReportError={handleReportError}
      />

      <LegislationFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedChambers={pendingChambers}
        selectedPolicyAreas={pendingPolicyAreas}
        selectedLegislationTypes={pendingLegislationTypes}
        toggleChamber={(id) =>
          setPendingChambers((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
          )
        }
        togglePolicyArea={(id) =>
          setPendingPolicyAreas((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
          )
        }
        toggleLegislationType={(id) =>
          setPendingLegislationTypes((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
          )
        }
        onCancel={handleFilterCancel}
        onApply={handleFilterApply}
        setSelectedChambers={setPendingChambers}
        setSelectedPolicyAreas={setPendingPolicyAreas}
        setSelectedLegislationTypes={setPendingLegislationTypes}
        resultCount={pendingCount}
      />

      <SortDropdown
        showSortDropdown={showSortDropdown}
        setShowSortDropdown={setShowSortDropdown}
        selectedSort={selectedSort}
        setSelectedSort={(sort) => {
          if (sort === selectedSort) return;
          setIsFiltering(true);
          setShowSortDropdown(false);
          setSelectedSort(sort);
        }}
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

      <AddModal
        listsVersion={listsVersion}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
        currentItem={
          currentBill
            ? {
                id: `${currentBill.type.toLowerCase()}${currentBill.number}`,
                type: "bill",
                name: `${currentBill.type}.${currentBill.number} - ${currentBill.title}`,
                date: currentBill.latestAction?.actionDate,
                latestAction: currentBill.latestAction?.text,
                policyArea:
                  enrichedBills[currentBillId ?? ""]?.policyArea?.name,
              }
            : undefined
        }
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
                style={{
                  fontSize: 14,
                  color: "#535353",
                  textAlign: "center",
                }}
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

const BillCard = React.memo(function BillCard({
  item,
  onAddPress,
  enrichedData,
}: {
  item: any;
  onAddPress: (id: string) => void;
  enrichedData?: any;
}) {
  const router = useRouter();
  const billId = `${item.type.toLowerCase()}${item.number}`;
  const policyAreas = usePolicyAreas();
  const policyArea =
    policyAreas[`${item.type.toLowerCase()}${item.number}`] ||
    enrichedData?.policyArea?.name;
  // if (item.number === "144") {
  //   console.log("policyAreas loaded:", Object.keys(policyAreas).length);
  //   console.log("lookup key:", `${item.type.toLowerCase()}${item.number}`);
  //   console.log("result:", policyArea);
  //   console.log("sample keys:", Object.keys(policyAreas).slice(0, 3));
  // }
  // console.log(item.introducedDate, item.type, item.number);

  return (
    <Pressable
      onPress={() => {
        billCongressCache.set(billId, item.congress);
        router.navigate(`/bill/${billId}`);
      }}
    >
      <View style={componentStyles.officialCard}>
        <View
          style={[
            componentStyles.avatar,
            {
              backgroundColor: "#eee",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          {policyArea ? (
            <Image
              source={getBillIcon(policyArea)}
              style={{ width: "100%", height: "100%", borderRadius: 6 }}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#535353" }}
            >
              {item.type}
            </Text>
          )}
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <View style={[componentStyles.metaRow, { flexWrap: "nowrap" }]}>
            <Text style={[componentStyles.subtitle, { flexShrink: 0 }]}>
              {new Date(
                item.latestAction?.actionDate ?? item.introducedDate ?? 0,
              ).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </Text>
            {(enrichedData?.policyArea?.name || item.policyArea?.name) && (
              <>
                <Text style={componentStyles.separator}>·</Text>
                <Text
                  style={[componentStyles.subtitle, { flexShrink: 1 }]}
                  numberOfLines={1}
                >
                  {enrichedData?.policyArea?.name || item.policyArea?.name}
                </Text>
              </>
            )}
          </View>
          <Text style={componentStyles.name} numberOfLines={2}>
            {item.type}.{item.number} - {item.title}
          </Text>
          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle} numberOfLines={1}>
              {item.latestAction?.text ?? "No action yet"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAddPress(`${item.type.toLowerCase()}${item.number}`);
          }}
          style={({ pressed }) => ({
            padding: 8,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <Plus size={24} color="#008CFF" />
        </Pressable>
      </View>
    </Pressable>
  );
});
