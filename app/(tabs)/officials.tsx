import { useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import NewListNameModal from "../global_components/NewListNameModal";
import OfficialsOptionsModal from "../global_components/OfficialsOptionsModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";

type Official = {
  id: string;
  name: string;
  party: string;
  role: string;
  update?: string;
  avatar?: any;
};

const MOCK_OFFICIALS: Official[] = [
  {
    id: "1",
    name: "Kathy Hochul",
    party: "D",
    role: "Governor",
    avatar: require("../../assets/officials_images/k_hochul.jpg"),
  },
  {
    id: "2",
    name: "Antonio Delgado",
    party: "D",
    role: "Lieutenant Governor",
    avatar: require("../../assets/officials_images/a_delgado.jpg"),
  },
  {
    id: "3",
    name: "Charles E. Schumer",
    party: "D",
    role: "Senator",
    avatar: require("../../assets/officials_images/c_schumer.jpg"),
  },
  {
    id: "4",
    name: "Kirsten Gillibrand",
    party: "D",
    role: "Senator",
    avatar: require("../../assets/officials_images/k_gillibrand.webp"),
  },
  {
    id: "5",
    name: "Letitia James",
    party: "D",
    role: "Attorney General",
    avatar: require("../../assets/officials_images/l_james.png"),
  },
  {
    id: "6",
    name: "Thomas P. DiNapoli",
    party: "D",
    role: "Comptroller",
    avatar: require("../../assets/officials_images/t_dinapoli.jpg"),
  },
  {
    id: "7",
    name: "Alexandria Ocasio-Cortez",
    party: "D",
    role: "Representative, NY 14th District",
    avatar: require("../../assets/officials_images/aoc.webp"),
  },
];

export default function OfficialsScreen() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] =
    useState("New York");
  const [showListSelection, setShowListSelection] = useState(false);
  const [selectedList, setSelectedList] = useState("New York");

  // New List Modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleSetPriority = () => {
    console.log("Set as priority:", selectedList);
    // TODO: Backend call to mark this state as priority
  };

  const handleReportError = () => {
    console.log("Report error for:", selectedList);
    // TODO: Navigate to error reporting form or open modal
  };

  const handleNewListCreate = () => {
    if (newListName.trim()) {
      // TODO: Add to officials list management when backend is ready
      console.log("New list created:", newListName.trim());
      setNewListName("");
      setShowNewListModal(false);
    }
  };

  const router = useRouter();

  const LOCATION_OPTIONS = [
    "Federal",
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  return (
    <View style={componentStyles.container}>
      <View style={componentStyles.headerBar}>
        <View style={componentStyles.headerLeft}>
          <Pressable
            onPress={() => setShowListSelection(!showListSelection)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={[componentStyles.header, { alignItems: "center" }]}>
                {selectedList}
              </Text>
              {showListSelection ? (
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

      <FlatList
        data={MOCK_OFFICIALS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => <OfficialCard item={item} />}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedList}
        items={MOCK_OFFICIALS}
        onItemPress={(item) => {
          router.navigate(`/official/${item.id}`);
        }}
        onNewListPress={() => setShowNewListModal(true)}
      />

      {/* Official Options Modal */}
      <OfficialsOptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        onSetPriority={handleSetPriority}
        onReportError={handleReportError}
      />

      {/* Location Selection Dropdown */}
      <Modal
        visible={showListSelection}
        transparent
        animationType="fade"
        onRequestClose={() => setShowListSelection(false)}
        statusBarTranslucent
      >
        <Pressable
          style={[componentStyles.modalOverlay, { justifyContent: "center" }]}
          onPress={() => setShowListSelection(false)}
        >
          <ScrollView
            style={[componentStyles.dropdown, { marginVertical: 96 }]}
          >
            {LOCATION_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={({ pressed }) =>
                  pressed
                    ? componentStyles.dropdownItemPressed
                    : componentStyles.dropdownItem
                }
                onPress={() => {
                  setSelectedList(option);
                  setShowListSelection(false);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={componentStyles.dropdownItemText}>{option}</Text>
                  {selectedList === option && (
                    <Check size={20} color="#008CFF" strokeWidth={4} />
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Modal>

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

function OfficialCard({ item }: { item: Official }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate(`/official/${item.id}`)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={componentStyles.officialCard}>
        <Image source={item.avatar} style={componentStyles.avatar} />

        <View>
          <Text style={componentStyles.name}>{item.name}</Text>

          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle}>{item.party}</Text>
            <Text style={componentStyles.separator}>·</Text>
            <Text style={componentStyles.subtitle}>{item.role}</Text>
            {item.update ? (
              <>
                <Text style={componentStyles.separator}>·</Text>
                <Text style={componentStyles.update}>{item.update}</Text>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
