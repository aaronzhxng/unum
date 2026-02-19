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
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LegislationOptionsModal from "../global_components/LegislationOptionsModal";
import SortDropdown from "../global_components/LegislationSortDropdown";
import NewListNameModal from "../global_components/NewListNameModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";

import { useQuery } from "@tanstack/react-query";
import { billsService } from "../services/bills";
import { ListItem, storage } from "../utils/storage";

type Bill = {
  id: string;
  name: string;
  date: string;
  status: string;
  committee: string;
  avatar?: any;
};

// const MOCK_BILLS: Bill[] = [
//   {
//     id: "1",
//     name: "H.R.187 : MAPWaters Act of 2025",
//     date: "11/9/2024",
//     status: "",
//     committee: "Education",
//     avatar: require("../../assets/bills_icons/agriculture.png"),
//   },
//   {
//     id: "2",
//     name: "SB2 : Foundation School Program",
//     date: "2/27/2025",
//     status: "In Progress",
//     committee: "Judiciary",
//     avatar: require("../../assets/bills_icons/judiciary.png"),
//   },
//   {
//     id: "3",
//     name: "H.R.6636 : To advance sensible pri..",
//     date: "12/11/2025",
//     status: "Introduced",
//     committee: "Budget",
//     avatar: require("../../assets/bills_icons/budget.png"),
//   },
//   {
//     id: "4",
//     name: "SB2 : Foundation School Program",
//     date: "2/27/2025",
//     status: "In Progress",
//     committee: "Homeland Security",
//     avatar: require("../../assets/bills_icons/homelandsecurity.png"),
//   },
//   {
//     id: "5",
//     name: "SB2 : Foundation School Program",
//     date: "2/27/2025",
//     status: "In Progress",
//     committee: "Natural Resources",
//     avatar: require("../../assets/bills_icons/naturalresources.png"),
//   },
//   {
//     id: "6",
//     name: "H.R.6039 : Commonsense Legislat..",
//     date: "2/27/2025",
//     status: "Introduced",
//     committee: "Ethics",
//     avatar: require("../../assets/bills_icons/ethics.png"),
//   },
//   {
//     id: "7",
//     name: "SB2 : Foundation School Program",
//     date: "2/27/2025",
//     status: "In Progress",
//     committee: "Rules",
//     avatar: require("../../assets/bills_icons/rules.png"),
//   },
// ];

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

      {/* <FlatList
        data={MOCK_BILLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => <BillCard item={item} />}
      /> */}

      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error loading bills</Text>}

      <FlatList
        data={bills}
        keyExtractor={(item) => `${item.type}${item.number}`}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => <BillCard item={item} />}
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
    </View>
  );
}

// function BillCard({ item }: { item: Bill }) {
//   const router = useRouter();

//   return (
//     <Pressable
//       onPress={() => router.navigate(`/bill/${item.id}`)}
//       style={({ pressed }) => ({
//         transform: [{ scale: pressed ? 0.96 : 1 }],
//       })}
//     >
//       <View style={componentStyles.officialCard}>
//         <Image source={item.avatar} style={componentStyles.avatar} />

//         <View>
//           <Text style={componentStyles.name}>{item.name}</Text>

//           <View style={componentStyles.metaRow}>
//             <Text style={componentStyles.subtitle}>{item.date}</Text>
//             {item.status ? (
//               <>
//                 <Text style={componentStyles.separator}>·</Text>
//                 <Text style={componentStyles.subtitle}>{item.status}</Text>
//               </>
//             ) : null}
//             <Text style={componentStyles.separator}>·</Text>
//             <Text style={componentStyles.subtitle}>{item.committee}</Text>
//           </View>
//         </View>
//       </View>
//     </Pressable>
//   );
// }

function BillCard({ item }: { item: any }) {
  const router = useRouter();

  const handleAddToList = async () => {
    const listItem: ListItem = {
      id: `${item.type.toLowerCase()}${item.number}`,
      type: "bill",
      name: `${item.type}.${item.number} - ${item.title}`,
      date: item.latestAction.actionDate,
      committee: item.latestAction.text.substring(0, 30),
      update: "",
    };

    const lists = await storage.getLists();
    const myList = lists.find((l) => l.name === "My List");

    if (myList) {
      const alreadyExists = myList.items.some((i) => i.id === listItem.id);

      if (!alreadyExists) {
        myList.items.push(listItem);
        await storage.saveLists(lists);
        alert("Added to My List!");
      } else {
        alert("Already in your list!");
      }
    }
  };

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
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.name}>
            {item.type}.{item.number} - {item.title}
          </Text>

          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle}>
              {item.latestAction.actionDate}
            </Text>
            <Text style={componentStyles.separator}>·</Text>
            <Text style={componentStyles.subtitle}>
              {item.latestAction.text.substring(0, 30)}...
            </Text>
          </View>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleAddToList();
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
