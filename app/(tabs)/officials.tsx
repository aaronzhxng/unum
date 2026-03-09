import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import AddModal from "../global_components/AddModal";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import OfficialsOptionsModal from "../global_components/OfficialsOptionsModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import { officialsService } from "../services/officials";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { storage } from "../utils/storage";

type Official = {
  id: string;
  name: string;
  party: string;
  role: string;
  update?: string;
  avatar?: any;
  chamber?: string;
  district?: number;
  state?: string;
  bioguideId?: string;
};

export default function OfficialsScreen() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] =
    useState("New York");
  const [showListSelection, setShowListSelection] = useState(false);
  const [selectedList, setSelectedList] = useState("All States");

  // New List Modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const handleSetPriority = () => {
    // console.log("Set as priority:", selectedList);
    // TODO: Backend call to mark this state as priority
  };

  const handleReportError = () => {
    // console.log("Report error for:", selectedList);
    // TODO: Navigate to error reporting form or open modal
  };

  const handleNewListCreate = async () => {
    if (newListName.trim()) {
      const allLists = await storage.getLists();

      const itemToSave = pendingItemForNewList
        ? {
            id: pendingItemForNewList.id ?? pendingItemForNewList.bioguideId,
            type:
              pendingItemForNewList.type === "official" ||
              pendingItemForNewList.bioguideId ||
              pendingItemForNewList.depiction
                ? ("official" as const)
                : ("bill" as const),
            name: pendingItemForNewList.name,
            party:
              pendingItemForNewList.party ??
              pendingItemForNewList.partyName?.charAt(0),
            role:
              pendingItemForNewList.role ??
              (pendingItemForNewList.chamber === "House of Representatives"
                ? `Representative, ${pendingItemForNewList.state}${pendingItemForNewList.district ? `, District ${pendingItemForNewList.district}` : ""}`
                : `Senator, ${pendingItemForNewList.state}`),
            date: pendingItemForNewList.date,
            latestAction:
              typeof pendingItemForNewList.latestAction === "string"
                ? pendingItemForNewList.latestAction
                : pendingItemForNewList.latestAction?.text,
            policyArea:
              pendingItemForNewList.policyArea?.name ??
              pendingItemForNewList.policyArea,
            photoUrl:
              pendingItemForNewList.photoUrl ??
              pendingItemForNewList.depiction?.imageUrl,
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
      console.log("🔔 LIST_UPDATED emitted");
      listEvents.emit(LIST_UPDATED);
      setCreatedListName(newListName.trim());
      setShowNewListProgressModal(true);
      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [currentOfficialId, setCurrentOfficialId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const LOCATION_OPTIONS = [
    "All States",
    "Alabama",
    "Alaska",
    "American Samoa",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "District of Columbia",
    "Florida",
    "Georgia",
    "Guam",
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
    "Northern Mariana Islands",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Puerto Rico",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virgin Islands",
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

  const allOfficials = data?.officials || [];

  // Filter officials based on selected state
  const officials = useMemo(() => {
    const filtered =
      selectedList === "All States"
        ? allOfficials
        : allOfficials.filter((official) => official.state === selectedList);

    return [...filtered].sort((a: any, b: any) => {
      // Sort by state alphabetically
      if (a.state < b.state) return -1;
      if (a.state > b.state) return 1;

      // Within same state: senators first
      const aIsSenator = a.chamber !== "House of Representatives";
      const bIsSenator = b.chamber !== "House of Representatives";
      if (aIsSenator && !bIsSenator) return -1;
      if (!aIsSenator && bIsSenator) return 1;

      // Both reps: sort by district number
      return (a.district ?? 0) - (b.district ?? 0);
    });
  }, [allOfficials, selectedList]);

  const currentOfficial = allOfficials.find(
    (o) => o.bioguideId === currentOfficialId,
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
          Loading officials...
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
        renderItem={({ item }) => (
          <OfficialCard
            item={item}
            onAddPress={(id) => {
              setCurrentOfficialId(id);
              setShowAddModal(true);
            }}
          />
        )}
        directionalLockEnabled={true}
      />

      {/* Add Modal */}
      <AddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
        currentItem={(() => {
          const official = allOfficials.find(
            (o) => o.bioguideId === currentOfficialId,
          );
          if (!official) return undefined;
          return {
            id: official.bioguideId,
            type: "official",
            name: official.name,
            party: official.partyName?.charAt(0) || "",
            role: official.district
              ? `Representative, ${official.state}, District ${official.district}`
              : `Senator, ${official.state}`,
            photoUrl: (official as any).depiction?.imageUrl || undefined,
          };
        })()}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedList}
        items={officials}
        onItemPress={(item) => {
          router.navigate(`/official/${item.bioguideId}`);
        }}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
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

function OfficialCard({
  item,
  onAddPress,
}: {
  item: any;
  onAddPress: (id: string) => void;
}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
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
          <View
            style={[componentStyles.avatar, { backgroundColor: "#eee" }]}
          ></View>
        )}

        {/* Official Info */}
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.name}>
            {item.name?.includes(",")
              ? item.name
                  .split(",")
                  .reverse()
                  .map((s: string) => s.trim())
                  .join(" ")
              : item.name}
          </Text>
          <View style={componentStyles.metaRow}>
            <Text style={componentStyles.subtitle}>
              {item.partyName?.charAt(0) || ""} ·{" "}
              {item.chamber === "House of Representatives"
                ? `Representative, ${item.state}${item.district ? `, District ${item.district}` : ""}`
                : `Senator, ${item.state}`}
            </Text>
          </View>
        </View>

        {/* Plus Button */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onAddPress(item.bioguideId);
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
