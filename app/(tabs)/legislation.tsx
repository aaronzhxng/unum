import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import AddModal from "../bill/bill_components/AddModal";
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LegislationOptionsModal from "../global_components/LegislationOptionsModal";
import SortDropdown from "../global_components/LegislationSortDropdown";
import NewListNameModal from "../global_components/NewListNameModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";

import { useQuery } from "@tanstack/react-query";
import { billsService } from "../services/bills";

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
  const [selectedSort, setSelectedSort] = useState("Most Viewed");

  // New List Modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleReportError = () => {
    // console.log("Report error for legislation");
    // TODO: Navigate to error reporting form or open modal
  };

  const handleNewListCreate = () => {
    if (newListName.trim()) {
      // TODO: Add to bills list management when backend is ready
      // console.log("New list created:", newListName.trim());
      setNewListName("");
      setShowNewListModal(false);
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
      if (chamber === "joint") return "Joint";
    }
    return "Congress";
  };

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
    // Reset to defaults or keep selections
    setShowFilterModal(false);
  };

  const handleFilterApply = () => {
    // Apply filters to your bill list
    // console.log("Chambers:", selectedChambers);
    // console.log("Policy Areas:", selectedPolicyAreas);
    // console.log("Types:", selectedLegislationTypes);
    setShowFilterModal(false);
  };

  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["bills"],
    queryFn: billsService.getAll,
  });

  // console.log("Bills data:", data);
  // console.log("Loading:", isLoading);
  // console.log("Error:", error);

  const bills = data?.bills || [];

  const currentBill = bills.find(
    (b) => `${b.type.toLowerCase()}${b.number}` === currentBillId,
  );

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

      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error loading bills</Text>}

      <FlatList
        data={bills}
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
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedFilter}
        items={bills}
        onItemPress={(item) => {
          router.navigate(`/bill/${item.nnumber}`);
        }}
        onNewListPress={() => setShowNewListModal(true)}
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
        onNewListPress={() => setShowNewListModal(true)}
        currentItem={
          currentBill
            ? {
                id: `${currentBill.type.toLowerCase()}${currentBill.number}`,
                type: "bill",
                name: `${currentBill.type}.${currentBill.number} - ${currentBill.title}`,
                date: currentBill.latestAction.actionDate,
                committee: currentBill.latestAction.text,
              }
            : undefined
        }
      />
    </View>
  );
}

function BillCard({
  item,
  onAddPress,
}: {
  item: any;
  onAddPress: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.navigate(`/bill/${item.type.toLowerCase()}${item.number}`)
      }
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={componentStyles.officialCard}>
        {/* Bill Icon/Avatar */}
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
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#535353" }}>
            {item.type}
          </Text>
        </View>

        {/* Bill Info */}
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.name} numberOfLines={2}>
            {item.type}.{item.number} - {item.title}
          </Text>

          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle}>
              {new Date(item.latestAction.actionDate).toLocaleDateString(
                "en-US",
                {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                },
              )}
            </Text>
            <Text style={componentStyles.separator}>·</Text>
            <Text
              style={[componentStyles.subtitle, { maxWidth: 148 }]}
              numberOfLines={1}
            >
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
