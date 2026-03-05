import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
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
import { storage } from "../utils/storage";

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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] =
    useState("Congress");

  // Sort dropdown (Most Viewed)
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Recent Action");
  // New List Modal
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

  const handleReportError = () => {
    // console.log("Report error for legislation");
    // TODO: Navigate to error reporting form or open modal
  };

  const handleNewListCreate = async () => {
    if (newListName.trim()) {
      const allLists = await storage.getLists();

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
        name: newListName.trim(),
        items: itemToSave ? [itemToSave] : [],
      };

      allLists.push(newList);
      await storage.saveLists(allLists);
      setCreatedListName(newListName.trim());
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [currentBillId, setCurrentBillId] = useState<string | null>(null);

  const getFilterLabel = () => {
    if (selectedChambers.length === 1) {
      const chamber = selectedChambers[0];
      if (chamber === "house") return "House";
      if (chamber === "senate") return "Senate";
    }
    return "Congress";
  };

  const POLICY_AREA_OPTIONS: FilterOption[] = [
    { id: "all", label: "All" },
    { id: "agriculture", label: "Agriculture and Food" },
    { id: "animals", label: "Animals" },
    { id: "armed-forces", label: "Armed Forces and National Security" },
    { id: "arts", label: "Arts, Culture, Religion" },
    {
      id: "civil-rights",
      label: "Civil Rights and Liberties, Minority Issues",
    },
    { id: "commerce", label: "Commerce" },
    { id: "congress", label: "Congress" },
    { id: "crime", label: "Crime and Law Enforcement" },
    { id: "economics", label: "Economics and Public Finance" },
    { id: "education", label: "Education" },
    { id: "emergency", label: "Emergency Management" },
    { id: "energy", label: "Energy" },
    { id: "environmental", label: "Environmental Protection" },
    { id: "families", label: "Families" },
    { id: "finance", label: "Finance and Financial Sector" },
    { id: "foreign-trade", label: "Foreign Trade and International Finance" },
    { id: "government", label: "Government Operations and Politics" },
    { id: "health", label: "Health" },
    { id: "housing", label: "Housing and Community Development" },
    { id: "immigration", label: "Immigration" },
    { id: "international", label: "International Affairs" },
    { id: "labor", label: "Labor and Employment" },
    { id: "law", label: "Law" },
    { id: "native-americans", label: "Native Americans" },
    { id: "public-lands", label: "Public Lands and Natural Resources" },
    { id: "science", label: "Science, Technology, Communications" },
    { id: "social-welfare", label: "Social Welfare" },
    { id: "sports", label: "Sports and Recreation" },
    { id: "taxation", label: "Taxation" },
    { id: "transportation", label: "Transportation and Public Works" },
    { id: "water", label: "Water Resources Development" },
  ];

  const SORT_OPTIONS = [
    "Most Viewed",
    "Recent Action",
    "Newest First",
    "Oldest First",
  ];

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
    setShowFilterModal(false);
  };

  const handleFilterApply = () => {
    setShowFilterModal(false);
  };

  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bills"],
    queryFn: billsService.getAll,
  });

  const allBills = data?.bills || []; // Rename to allBills

  const bills = useMemo(() => {
    let filtered = allBills;

    // if (filtered.length > 0) {
    //   console.log("First bill data:", filtered[0]);
    //   console.log("Policy area:", (filtered[0] as any).policyArea);
    // }

    // Filter by chamber
    if (selectedChambers.length > 0) {
      filtered = filtered.filter((bill) =>
        selectedChambers.some((chamber) => {
          if (chamber === "house")
            return (bill as any).originChamber === "House";
          if (chamber === "senate")
            return (bill as any).originChamber === "Senate";
          return false;
        }),
      );
    }

    // Filter by policy area
    // if (
    //   selectedPolicyAreas.length > 0 &&
    //   !selectedPolicyAreas.includes("all")
    // ) {
    //   // Map IDs to labels for comparison
    //   const policyLabels = selectedPolicyAreas
    //     .map((id) => POLICY_AREA_OPTIONS.find((opt) => opt.id === id)?.label)
    //     .filter(Boolean); // Remove undefined values

    //   console.log("Selected policy labels:", policyLabels);
    //   console.log(
    //     "Sample bill policy areas:",
    //     allBills.slice(0, 3).map((b) => (b as any).policyArea?.name),
    //   );

    //   filtered = filtered.filter((bill) => {
    //     const matches = policyLabels.includes((bill as any).policyArea?.name);
    //     if (matches) console.log("Matched:", (bill as any).policyArea?.name);
    //     return matches;
    //   });

    //   console.log("After policy filter:", filtered.length);
    //   console.log("Full bill sample:", JSON.stringify(allBills[0], null, 2));
    // }

    // Filter by legislation type
    // Filter by legislation type
    if (
      selectedLegislationTypes.length > 0 &&
      !selectedLegislationTypes.includes("all")
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

      const apiTypes = selectedLegislationTypes.flatMap(
        (id) => typeMap[id] || [],
      );

      filtered = filtered.filter((bill) =>
        apiTypes.includes((bill as any).type),
      );
    }

    // Sort
    let sorted = [...filtered];
    if (selectedSort === "Recent Action") {
      sorted.sort(
        (a, b) =>
          new Date((b as any).latestAction.actionDate).getTime() -
          new Date((a as any).latestAction.actionDate).getTime(),
      );
    } else if (selectedSort === "Most Viewed") {
      // Keep original API order — Congress.gov returns by relevance by default
      // No sort applied
    } else if (selectedSort === "Newest First") {
      sorted.sort((a, b) => (b as any).number - (a as any).number);
    } else if (selectedSort === "Oldest First") {
      sorted.sort((a, b) => (a as any).number - (b as any).number);
    }
    return sorted;
  }, [
    allBills,
    selectedChambers,
    selectedPolicyAreas,
    selectedLegislationTypes,
    selectedSort,
  ]);

  useEffect(() => {
    const enrichBillsFromCache = async () => {
      const enriched: { [key: string]: any } = {};

      for (const bill of bills) {
        const billId = `${(bill as any).type.toLowerCase()}${(bill as any).number}`;
        const cacheKey = `${(bill as any).congress}-${billId}`;
        const cached = await billCache.getBill(cacheKey);

        if (cached?.policyArea) {
          enriched[billId] = cached;
        }
      }

      setEnrichedBills(enriched);
    };

    if (bills.length > 0) {
      enrichBillsFromCache();
    }
  }, [bills]);

  // Then use 'bills' in your FlatList (which you already do)
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
          {/* Congress Filter Dropdown */}
          <Pressable
            onPress={() => {
              setShowSortDropdown(false);
              setShowFilterModal(true);
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

          {/* Most Viewed Sort Dropdown */}
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
                  {
                    fontSize: 16,
                    fontWeight: 500,
                  },
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

        {/* Right Icons */}
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
        directionalLockEnabled={true}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedFilter}
        items={bills.map((item: any) => ({
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
        }))}
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

      {/* Legislation Options Modal */}
      <LegislationOptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        onReportError={handleReportError}
      />

      {/* Legislation Filter Modal */}
      <LegislationFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedChambers={selectedChambers}
        selectedPolicyAreas={selectedPolicyAreas}
        selectedLegislationTypes={selectedLegislationTypes}
        toggleChamber={toggleChamber}
        togglePolicyArea={togglePolicyArea}
        toggleLegislationType={toggleLegislationType}
        onCancel={handleFilterCancel}
        onApply={handleFilterApply}
        setSelectedChambers={setSelectedChambers} // ADD THIS
        setSelectedPolicyAreas={setSelectedPolicyAreas} // ADD THIS
        setSelectedLegislationTypes={setSelectedLegislationTypes} // ADD THIS
        resultCount={bills.length} // ADD THIS
      />

      {/* Legislation Sort Dropdown */}
      <SortDropdown
        showSortDropdown={showSortDropdown}
        setShowSortDropdown={setShowSortDropdown}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />

      {/* New List Name Modal */}
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
                date: currentBill.latestAction.actionDate,
                latestAction: currentBill.latestAction.text,
                policyArea:
                  enrichedBills[currentBillId ?? ""]?.policyArea?.name,
              }
            : undefined
        }
      />

      {/* New List Progress Modal */}
      {/* New List Progress Modal */}
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
              Creating and adding to {newListName || "new list"}...
            </Text>

            {/* Progress Bar */}
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

            {/* Progress Text */}
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

            {/* Cancel Button - ADD THIS */}
            <Pressable
              onPress={async () => {
                // Delete the newly created list
                const allLists = await storage.getLists();
                const newlyCreatedList = allLists.find(
                  (l) => l.name === createdListName,
                );

                if (newlyCreatedList) {
                  await storage.deleteList(newlyCreatedList.id);
                }

                // Close modal and reset
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

function BillCard({
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
  const policyArea =
    enrichedData?.policyArea?.name || (item as any).policyArea?.name;

  return (
    <Pressable
      onPress={() => {
        billCongressCache.set(billId, item.congress);
        router.navigate(`/bill/${billId}`);
      }}
    >
      {" "}
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

        {/* Bill Info */}
        <View style={{ flex: 1, gap: 4 }}>
          <View style={[componentStyles.metaRow, { flexWrap: "nowrap" }]}>
            <Text style={[componentStyles.subtitle, { flexShrink: 0 }]}>
              {new Date(item.latestAction.actionDate).toLocaleDateString(
                "en-US",
                {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                },
              )}
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
              {item.latestAction.text}
            </Text>
          </View>
        </View>

        {/* Plus Button */}
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
}
