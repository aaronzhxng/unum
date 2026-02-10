import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import OptionsModal from "../global_components/OptionsModal";
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

  // Filter dropdown (Congress) — placeholder until FilterDropdown is wired up
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Congress");

  // Sort dropdown (Most Viewed)
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most Viewed");

  return (
    <View style={componentStyles.container}>
      {/* Header */}
      <View style={componentStyles.headerBar}>
        <View style={componentStyles.headerLeft}>
          {/* Congress Filter Dropdown */}
          <Pressable
            onPress={() => {
              setShowSortDropdown(false);
              setShowFilterDropdown(!showFilterDropdown);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={[componentStyles.header, { alignItems: "center" }]}>
                {selectedFilter}
              </Text>
              {showFilterDropdown ? (
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
              setShowFilterDropdown(false);
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
                paddingTop: 5,
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

      {/* Sort Dropdown Menu */}
      {showSortDropdown && (
        <Pressable
          style={componentStyles.modalOverlay}
          onPress={() => setShowSortDropdown(false)}
        >
          <View style={componentStyles.dropdown}>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={({ pressed }) =>
                  pressed
                    ? componentStyles.dropdownItemPressed
                    : componentStyles.dropdownItem
                }
                onPress={() => {
                  setSelectedSort(option);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={componentStyles.dropdownItemText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}

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

      {/* Options Modal */}
      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
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
