import { useNavigation, useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditOptionsModal from "../global_components/EditOptionsModal";
import ListSelection from "../global_components/ListSelection";
import OptionsModal from "../global_components/OptionsModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";

type ItemType = "official" | "bill";

type Item = {
  id: string;
  type: ItemType;
  name: string;
  party: string;
  role: string;
  date: string;
  committee: string;
  update: string;
  avatar?: any;
};

const INITIAL_ITEMS: Item[] = [
  {
    id: "1",
    type: "official",
    name: "Zohran Mamdani",
    party: "D",
    role: "Mayor, New York City",
    date: "",
    committee: "",
    update: "",
    avatar: require("../../assets/officials_images/zohran.jpg"),
  },
  {
    id: "2",
    type: "bill",
    name: "H.R.187 · MAPWaters Act of 2025",
    party: "",
    role: "",
    date: "12/18/2025",
    committee: "Agriculture",
    update: "To President",
    avatar: require("../../assets/bills_icons/agriculture.png"),
  },
  {
    id: "3",
    type: "official",
    name: "Alexandria Ocasio-Cortez",
    party: "D",
    role: "Representative, NY 14th District",
    date: "",
    committee: "",
    update: "",
    avatar: require("../../assets/officials_images/aoc.webp"),
  },
  {
    id: "4",
    type: "official",
    name: "John Kennedy",
    party: "R",
    role: "Senator, Louisiana",
    date: "",
    committee: "",
    update: "Up for Reelection",
    avatar: require("../../assets/officials_images/jKennedy.jpg"),
  },
  {
    id: "5",
    type: "official",
    name: "Donald Trump",
    party: "R",
    role: "President, United States",
    date: "",
    committee: "",
    update: "",
    avatar: require("../../assets/officials_images/d_trump.jpg"),
  },
  {
    id: "6",
    type: "official",
    name: "Andy Beshear",
    party: "D",
    role: "Governor, Kentucky",
    date: "",
    committee: "",
    update: "",
    avatar: require("../../assets/officials_images/a_beshear.jpg"),
  },
  {
    id: "7",
    type: "bill",
    name: "H.R.187 - National Defense Authorizatio..",
    party: "",
    role: "",
    date: "7/15/2025",
    committee: "Armed Services",
    update: "Passed Senate",
    avatar: require("../../assets/bills_icons/armedservices.png"),
  },
];

export default function HomeScreen() {
  const router = useRouter();

  // Normal mode state
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState("My List");
  const [showListSelection, setShowListSelection] = useState(false);
  const [selectedList, setSelectedList] = useState("My List");

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditOptions, setShowEditOptions] = useState(false);

  const allSelected = selectedIds.size === items.length;

  const enterEditMode = (triggerId: string) => {
    setIsEditMode(true);
    setSelectedIds(new Set([triggerId]));
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleRemoveConfirm = () => {
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setShowRemoveModal(false);
    exitEditMode();
  };

  const handleEditConfirm = (action: "copy" | "move", lists: string[]) => {
    // If moving, remove the selected items from current list
    if (action === "move") {
      setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    }

    // Navigate to the first selected list
    setSelectedList(lists[0]);

    // Exit edit mode and close modal
    setShowEditOptions(false);
    exitEditMode();
  };

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isEditMode ? { display: "none" } : { height: 100 },
    });
  }, [isEditMode]);

  return (
    <View style={componentStyles.container}>
      {/* Header */}
      <View style={componentStyles.headerBar}>
        {isEditMode ? (
          // Edit mode header
          <>
            <View style={componentStyles.headerLeft}>
              {/* Select All circle */}
              <Pressable onPress={toggleSelectAll} style={{ marginRight: 12 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: allSelected ? "#008CFF" : "#bfbfbf",
                    backgroundColor: allSelected ? "#008CFF" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  {allSelected && <Check size={18} color="white" />}
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#535353",
                    textAlign: "center",
                    marginTop: -10,
                  }}
                >
                  All
                </Text>
              </Pressable>

              <Text style={[componentStyles.header, { marginBottom: 16 }]}>
                {selectedIds.size} selected
              </Text>
            </View>

            <View style={componentStyles.headerRight}>
              <Pressable
                onPress={() => setShowEditOptions(true)}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.75 : 1 }],
                })}
              >
                <MoreVertical size={24} color="#535353" />
              </Pressable>
            </View>
          </>
        ) : (
          // Normal header
          <>
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
                  <Text
                    style={[componentStyles.header, { alignItems: "center" }]}
                  >
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
          </>
        )}
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => (
          <Card
            item={item}
            isEditMode={isEditMode}
            isSelected={selectedIds.has(item.id)}
            onLongPress={() => enterEditMode(item.id)}
            onPress={() => isEditMode && toggleSelect(item.id)}
          />
        )}
      />

      {/* Bottom Cancel / Remove bar (edit mode only) */}
      {isEditMode && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            backgroundColor: "#fafafa",
            paddingTop: 12,
            paddingBottom: 48,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: "center" }}
            onPress={exitEditMode}
          >
            <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
          </TouchableOpacity>

          <View
            style={{ width: 1, backgroundColor: "#e0e0e0", marginVertical: 12 }}
          />

          <TouchableOpacity
            style={{ flex: 1, paddingVertical: 16, alignItems: "center" }}
            onPress={() => selectedIds.size > 0 && setShowRemoveModal(true)}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: selectedIds.size > 0 ? "#FF3B30" : "#bfbfbf",
              }}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Remove Confirmation Modal */}
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={[componentStyles.modalOverlay, { justifyContent: "center" }]}
          onPress={() => setShowRemoveModal(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#fafafa",
              marginHorizontal: 16,
              borderRadius: 12,
              paddingTop: 24,
              paddingHorizontal: 24,
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
                color: "#000000",
                marginBottom: 8,
              }}
            >
              Remove
            </Text>
            <Text style={{ fontSize: 14, color: "#7B7C81", marginBottom: 4 }}>
              {selectedIds.size === 1
                ? "This item will be removed from your list."
                : `${selectedIds.size} items will be removed from your list.`}
            </Text>

            {/* <View
              style={{ height: 1, backgroundColor: "#e0e0e0", marginTop: 16 }}
            /> */}

            <View style={{ flexDirection: "row", marginVertical: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
                onPress={() => setShowRemoveModal(false)}
              >
                <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
              </TouchableOpacity>

              <View
                style={{
                  width: 1,
                  backgroundColor: "#e0e0e0",
                  marginVertical: 12,
                }}
              />

              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
                onPress={handleRemoveConfirm}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FF3B30" }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedList} // "My List", "Swing States", etc.
        items={items} // Your MOCK_ITEMS or filtered items
        onItemPress={(item) => {
          // Navigate to the item
          if (item.type === "official") {
            router.navigate(`/official/${item.id}`);
          } else {
            router.navigate(`/bill/${item.id}`);
          }
        }}
      />

      {/* Options Modal */}
      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
      />

      {/* List Selection Modal */}
      <ListSelection
        showListSelection={showListSelection}
        setShowListSelection={setShowListSelection}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
      />
      {/* Edit Options Modal */}
      <EditOptionsModal
        visible={showEditOptions}
        onClose={() => setShowEditOptions(false)}
        onConfirm={handleEditConfirm}
      />
    </View>
  );
}

function Card({
  item,
  isEditMode,
  isSelected,
  onLongPress,
  onPress,
}: {
  item: Item;
  isEditMode: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
}) {
  const router = useRouter();
  const isOfficial = item.type === "official";

  const handlePress = () => {
    if (isEditMode) {
      onPress();
    } else if (isOfficial) {
      router.navigate(`/official/${item.id}`);
    } else {
      router.navigate(`/bill/${item.id}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={componentStyles.officialCard}>
        {/* Avatar with selection overlay */}
        <View>
          <Image source={item.avatar} style={componentStyles.avatar} />
          {isEditMode && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 50,
                height: 50,
                borderRadius: 32,
                backgroundColor: isSelected ? "#008CFF" : "rgba(0,0,0,0.15)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isSelected && <Check size={24} color="white" />}
            </View>
          )}
        </View>

        {isOfficial ? (
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
        ) : (
          <View>
            <Text style={componentStyles.name}>{item.name}</Text>
            <View style={componentStyles.metaRow}>
              <Text style={componentStyles.subtitle}>{item.date}</Text>
              <Text style={componentStyles.separator}>·</Text>
              <Text style={componentStyles.subtitle}>{item.committee}</Text>
              {item.update ? (
                <>
                  <Text style={componentStyles.separator}>·</Text>
                  <Text style={componentStyles.update}>{item.update}</Text>
                </>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
