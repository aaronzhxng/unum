import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  BackHandler,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useTabBar } from "../context/TabBarContext";
import { useTour } from "../context/TourContext";
import AddModal from "../global_components/AddModal";
import ErrorScreen from "../global_components/ErrorScreen";
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LegislationOptionsModal from "../global_components/LegislationOptionsModal";
import SortDropdown from "../global_components/LegislationSortDropdown";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import ReportErrorModal from "../global_components/ReportErrorModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import { billsService } from "../services/bills";
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

export default function LegislationScreen() {
  const filterButtonRef = useRef<View>(null);
  const optionsButtonRef = useRef<View>(null);
  const { isActive, currentStep, setTargetLayout } = useTour();
  const { setTabBarHidden } = useTabBar();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFallbackResults, setSearchFallbackResults] = useState<any[]>([]);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recent Action");

  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedChambers, setSelectedChambers] = useState<string[]>([]);
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<string[]>([]);
  const [selectedLegislationTypes, setSelectedLegislationTypes] = useState<
    string[]
  >([]);
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
  const PAGE_SIZE = 50;
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);

  const searchInputRef = useRef<TextInput>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [showActionToast, setShowActionToast] = useState(false);
  const [actionToastMessage, setActionToastMessage] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();

  const getFilterLabel = () => {
    if (selectedChambers.length === 1) {
      if (selectedChambers[0] === "house") return "House";
      if (selectedChambers[0] === "senate") return "Senate";
    }
    return "Congress";
  };

  const { width: screenWidth } = useWindowDimensions();

  const [showReportModal, setShowReportModal] = useState(false);
  const handleReportError = () => setShowReportModal(true);

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
      setTimeout(() => showToast(`Added to ${name.trim()}`), 1000);
      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
    }
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

  const showToast = (message: string) => {
    setActionToastMessage(message);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 1500);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bills", "v2"],
    queryFn: billsService.getAll,
  });

  useFocusEffect(
    useCallback(() => {
      const state = queryClient.getQueryState(["bills", "v2"]);
      const isStale =
        !state?.dataUpdatedAt ||
        Date.now() - state.dataUpdatedAt > 1000 * 60 * 120; // 120 minutes
      if (isStale) {
        queryClient.invalidateQueries({ queryKey: ["bills", "v2"] });
      }
    }, []),
  );

  const allBills: any[] = useMemo(() => data?.bills || [], [data?.bills]);

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
        const pa = bill.policyArea?.name ?? null;
        if (!pa) return pendingPolicyAreas.includes("none");
        return pendingPolicyAreas.includes(pa);
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
    let filtered = [...allBills];

    if (debouncedChambers.length > 0) {
      filtered = filtered.filter((bill) =>
        debouncedChambers.some((chamber) => {
          if (chamber === "house") return bill.originChamber === "House";
          if (chamber === "senate") return bill.originChamber === "Senate";
          return false;
        }),
      );
    }
    if (debouncedPolicyAreas.length > 0) {
      filtered = filtered.filter((bill) => {
        const pa = bill.policyArea?.name ?? null;
        if (!pa) return debouncedPolicyAreas.includes("none");
        return debouncedPolicyAreas.includes(pa);
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
      filtered = filtered.filter((bill) => apiTypes.includes(bill.type));
    }

    if (selectedSort === "Most Popular") {
      filtered.sort(
        (a, b) => (a._apiOrder ?? 999999) - (b._apiOrder ?? 999999),
      );
    } else if (selectedSort === "Recent Action") {
      filtered.sort(
        (a, b) =>
          new Date(b.latestAction?.actionDate ?? b.updateDate ?? 0).getTime() -
          new Date(a.latestAction?.actionDate ?? a.updateDate ?? 0).getTime(),
      );
    } else if (selectedSort === "Oldest First") {
      filtered.sort(
        (a, b) =>
          new Date(a.latestAction?.actionDate ?? a.updateDate ?? 0).getTime() -
          new Date(b.latestAction?.actionDate ?? b.updateDate ?? 0).getTime(),
      );
    }
    return filtered;
  }, [
    allBills,
    debouncedChambers,
    debouncedPolicyAreas,
    debouncedLegislationTypes,
    selectedSort,
  ]);

  const displayedBills = useMemo(
    () => bills.slice(0, displayedCount),
    [bills, displayedCount],
  );

  const currentBill = bills.find(
    (b) => `${b.type.toLowerCase()}${b.number}` === currentBillId,
  );

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

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push("/(tabs)/home" as any);
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchFallbackResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await billsService.search(searchQuery);
        if (results?.bills?.length > 0) setSearchFallbackResults(results.bills);
      } catch {}
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

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

  useEffect(() => {
    const delay = setTimeout(() => {
      setDisplayedCount(PAGE_SIZE);
      setIsFiltering(true);
      const timer = setTimeout(() => setIsFiltering(false), 2250);
      return () => clearTimeout(timer);
    }, 50);
    return () => clearTimeout(delay);
  }, [selectedChambers, selectedPolicyAreas, selectedLegislationTypes]);

  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [selectedSort]);

  useEffect(() => {
    // Re-fetch bills after policy areas map is saved to SQLite
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isActive && currentStep === 5) {
      setTimeout(() => {
        filterButtonRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
    if (isActive && currentStep === 6) {
      setTimeout(() => {
        optionsButtonRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    return <ErrorScreen onRetry={refetch} />;
  }

  return (
    <View style={componentStyles.container}>
      {/* Header */}
      <View style={[componentStyles.headerBar, { alignItems: "center" }]}>
        <View
          style={[
            componentStyles.headerLeft,
            {
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              minWidth: 0,
            },
          ]}
        >
          {/* Chamber filter */}
          <Pressable
            onPress={() => {
              setShowSortDropdown(false);
              handleFilterOpen();
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
              flexShrink: 0,
            })}
          >
            <View
              ref={filterButtonRef}
              collapsable={false}
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

          {/* Sort dropdown */}
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
                ...(screenWidth < 390 && { maxWidth: 96 }),
              }}
            >
              <Text
                style={[
                  componentStyles.header,
                  {
                    fontSize: 16,
                    fontWeight: "500",
                    ...(screenWidth < 390 && { flexShrink: 1 }),
                  },
                ]}
                numberOfLines={screenWidth < 390 ? 2 : 1}
              >
                {selectedSort}
              </Text>
              <View style={{ flexShrink: 0 }}>
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
          <View ref={optionsButtonRef} collapsable={false}>
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
          data={displayedBills}
          keyExtractor={(item) => `${item.type}${item.number}`}
          contentContainerStyle={componentStyles.listContent}
          renderItem={({ item }) => (
            <BillCard
              item={item}
              onAddPress={(id) => {
                setCurrentBillId(id);
                setShowAddModal(true);
              }}
            />
          )}
          onEndReached={() => {
            if (displayedCount < bills.length) {
              setDisplayedCount((prev) => prev + PAGE_SIZE);
            }
          }}
          onEndReachedThreshold={0.5}
          directionalLockEnabled={true}
          ListFooterComponent={() => (
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
          )}
        />
      )}

      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={getFilterLabel()}
        items={[
          ...bills.map((item: any) => ({
            ...item,
            type: "bill",
            billType: item.type,
            name: `${item.type}.${item.number} - ${item.title}`,
            title: undefined,
            date: item.latestAction?.actionDate,
            policyArea: item.policyArea?.name ?? null,
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
            .map((item: any) => ({
              ...item,
              type: "bill",
              billType: item.type ?? item.billType,
              name: `${item.type ?? item.billType}.${item.number} - ${item.title}`,
              title: undefined,
              date: item.latestAction?.actionDate,
              policyArea: item.policyArea?.name ?? item.policyArea ?? null,
              latestAction: item.latestAction?.text ?? null,
              congress: item.congress ?? 119,
            })),
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

      <ReportErrorModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        screen="legislation" // change to "legislation" or "home" per file
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
                policyArea: currentBill.policyArea?.name ?? undefined,
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

const BillCard = React.memo(function BillCard({
  item,
  onAddPress,
}: {
  item: any;
  onAddPress: (id: string) => void;
}) {
  const router = useRouter();
  const billId = `${item.type.toLowerCase()}${item.number}`;
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
    item.latestAction?.actionDate ?? item.updateDate,
  );

  return (
    <Pressable
      onPress={() => {
        billCongressCache.set(billId, item.congress);
        router.navigate(`/bill/${billId}`);
      }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
        borderRadius: 48,
      })}
    >
      <View style={componentStyles.officialCard}>
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
          {/* Date + policy area + title grouped at top */}
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "nowrap",
                marginBottom: 4,
              }}
            >
              <Text style={[componentStyles.subtitle, { flexShrink: 0 }]}>
                {dateStr}
              </Text>
              {policyArea && (
                <>
                  <Text style={componentStyles.separator}>·</Text>
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
            <Text style={componentStyles.name} numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          {/* Latest action pinned to bottom */}
          <Text style={componentStyles.subtitle} numberOfLines={1}>
            {item.latestAction?.text ?? "No action yet"}
          </Text>
        </View>

        {/* Add button */}
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
