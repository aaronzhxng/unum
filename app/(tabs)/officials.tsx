import { useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
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

import { useQuery } from "@tanstack/react-query";
import { officialsService } from "../services/officials";

import { ListItem, storage } from "../utils/storage";

type Official = {
  id: string;
  name: string;
  party: string;
  role: string;
  update?: string;
  avatar?: any;
};

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
    // console.log("Set as priority:", selectedList);
    // TODO: Backend call to mark this state as priority
  };

  const handleReportError = () => {
    // console.log("Report error for:", selectedList);
    // TODO: Navigate to error reporting form or open modal
  };

  const handleNewListCreate = () => {
    if (newListName.trim()) {
      // TODO: Add to officials list management when backend is ready
      // console.log("New list created:", newListName.trim());
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["officials"],
    queryFn: officialsService.getAll,
  });

  const officials = data?.officials || [];

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
        data={officials}
        keyExtractor={(item) => item.bioguideId}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => <OfficialCard item={item} />}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedList}
        items={officials}
        onItemPress={(item) => {
          router.navigate(`/official/${item.number}`);
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

function OfficialCard({ item }: { item: any }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  // console.log("Officials list item:", item);
  // console.log("Item properties:", {
  //   name: item.name,
  //   lastName: item.lastName,
  //   directOrderName: item.directOrderName,
  // });

  const handleAddToList = async () => {
    const listItem: ListItem = {
      id: item.bioguideId,
      type: "official",
      name: item.name,
      party: item.partyName?.charAt(0) || "",
      role: item.district
        ? `Representative, ${item.state} - District ${item.district}`
        : `Senator, ${item.state}`,
      update: "",
      photoUrl: item.depiction?.imageUrl,
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
      onPress={() => router.navigate(`/official/${item.bioguideId}`)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={componentStyles.officialCard}>
        {/* Avatar */}
        {item.depiction?.imageUrl ? (
          <View style={componentStyles.avatar}>
            {item.depiction?.imageUrl && !imageError ? (
              <Image
                source={{ uri: item.depiction.imageUrl }}
                style={{
                  width: "100%",
                  height: "120%",
                }}
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
                  {item.name?.split(",")[0]?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[componentStyles.avatar, { backgroundColor: "#eee" }]} />
        )}

        {/* Official Info */}
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.name}>{item.name}</Text>
          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle}>
              {item.partyName?.charAt(0) || ""}
            </Text>
            <Text style={componentStyles.separator}>·</Text>
            <Text style={componentStyles.subtitle}>
              {item.district
                ? `Representative, ${item.state} - District ${item.district}`
                : `Senator, ${item.state}`}
            </Text>
          </View>
        </View>

        {/* Plus Button */}
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
