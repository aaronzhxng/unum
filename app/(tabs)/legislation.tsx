import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import LegislationFilterModal from "../global_components/LegislationFilterModal";
import LegislationOptionsModal from "../global_components/LegislationOptionsModal";
import SortDropdown from "../global_components/LegislationSortDropdown";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";

type Bill = {
  id: string;
  name: string;
  date: string;
  status: string;
  committee: string;
  avatar?: any;
};

const MOCK_BILLS: Bill[] = [
  {
    id: "1",
    name: "H.R.187 : MAPWaters Act of 2025",
    date: "11/9/2024",
    status: "",
    committee: "Education",
    avatar: require("../../assets/bills_icons/agriculture.png"),
  },
  {
    id: "2",
    name: "SB2 : Foundation School Program",
    date: "2/27/2025",
    status: "In Progress",
    committee: "Judiciary",
    avatar: require("../../assets/bills_icons/judiciary.png"),
  },
  {
    id: "3",
    name: "H.R.6636 : To advance sensible pri..",
    date: "12/11/2025",
    status: "Introduced",
    committee: "Budget",
    avatar: require("../../assets/bills_icons/budget.png"),
  },
  {
    id: "4",
    name: "SB2 : Foundation School Program",
    date: "2/27/2025",
    status: "In Progress",
    committee: "Homeland Security",
    avatar: require("../../assets/bills_icons/homelandsecurity.png"),
  },
  {
    id: "5",
    name: "SB2 : Foundation School Program",
    date: "2/27/2025",
    status: "In Progress",
    committee: "Natural Resources",
    avatar: require("../../assets/bills_icons/naturalresources.png"),
  },
  {
    id: "6",
    name: "H.R.6039 : Commonsense Legislat..",
    date: "2/27/2025",
    status: "Introduced",
    committee: "Ethics",
    avatar: require("../../assets/bills_icons/ethics.png"),
  },
  {
    id: "7",
    name: "SB2 : Foundation School Program",
    date: "2/27/2025",
    status: "In Progress",
    committee: "Rules",
    avatar: require("../../assets/bills_icons/rules.png"),
  },
];

const SORT_OPTIONS = ["Most Viewed", "Most Recent", "Alphabetical"];

export default function LegislationScreen() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] =
    useState("Congress");

  // Sort dropdown (Most Viewed)
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most Viewed");

  const handleReportError = () => {
    console.log("Report error for legislation");
    // TODO: Navigate to error reporting form or open modal
  };

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedChambers, setSelectedChambers] = useState<string[]>([]);
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<string[]>([]);
  const [selectedLegislationTypes, setSelectedLegislationTypes] = useState<
    string[]
  >([]);

  const SORT_OPTIONS = [
    "Most Viewed",
    "Most Recent Action",
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
    console.log("Chambers:", selectedChambers);
    console.log("Policy Areas:", selectedPolicyAreas);
    console.log("Types:", selectedLegislationTypes);
    setShowFilterModal(false);
  };

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
                Congress
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
        data={MOCK_BILLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => <BillCard item={item} />}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
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
    </View>
  );
}

function BillCard({ item }: { item: Bill }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate(`/bill/${item.id}`)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={componentStyles.officialCard}>
        <Image source={item.avatar} style={componentStyles.avatar} />

        <View>
          <Text style={componentStyles.name}>{item.name}</Text>

          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle}>{item.date}</Text>
            {item.status ? (
              <>
                <Text style={componentStyles.separator}>·</Text>
                <Text style={componentStyles.subtitle}>{item.status}</Text>
              </>
            ) : null}
            <Text style={componentStyles.separator}>·</Text>
            <Text style={componentStyles.subtitle}>{item.committee}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
