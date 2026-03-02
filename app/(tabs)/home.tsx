import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import EditOptionsModal from "../global_components/EditOptionsModal";
import ListSelection from "../global_components/ListSelection";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import OptionsModal from "../global_components/OptionsModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import { getBillIcon } from "../utils/billIcons";

import { storage, UserList } from "../utils/storage";

type ItemType = "official" | "bill";

import { ListItem } from "../utils/storage";

type Item = ListItem;

export default function HomeScreen() {
  const router = useRouter();

  // Normal mode state
  // const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);

  const saveItems = async (newItems: ListItem[]) => {
    const lists = await storage.getLists();
    const listIndex = lists.findIndex((l) => l.name === selectedList);

    if (listIndex >= 0) {
      lists[listIndex].items = newItems;
      await storage.saveLists(lists);
    }
  };

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

  const [items, setItems] = useState<ListItem[]>([]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListContext, setNewListContext] = useState<"main" | "search">(
    "main",
  );
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [createdListName, setCreatedListName] = useState("");

  const [hasMoved, setHasMoved] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<ListItem[]>([]);

  const [lists, setLists] = useState<Array<{ id: string; name: string }>>([]);
  const [currentList, setCurrentList] = useState<UserList | null>(null);

  const [currentListId, setCurrentListId] = useState<string>("");

  // In the loadItems function, track which list is loaded:
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = async () => {
    // console.log("=== loadItems called ===");
    setIsLoading(true); // Start loading

    const lists = await storage.getLists();
    const currentList = lists.find((l) => l.name === selectedList) || lists[0];

    if (currentList) {
      // console.log(
      //   "Full items data:",
      //   JSON.stringify(currentList.items, null, 2),
      // );

      setCurrentListId(currentList.id);
      setItems(currentList.items);
    }

    setIsLoading(false); // Done loading
  };

  // Create a refresh function:
  const refreshLists = async () => {
    const allLists = await storage.getLists();
    setLists(allLists.map((l) => ({ id: l.id, name: l.name })));

    // If current list was deleted, switch to first available list
    const listExists = allLists.some((l) => l.id === currentListId);
    if (!listExists && allLists.length > 0) {
      setSelectedList(allLists[0].name);
      setCurrentListId(allLists[0].id);
    }

    await loadItems();
  };

  const enterEditMode = (triggerId: string) => {
    setIsEditMode(true);
    setSelectedIds(new Set());
    setOriginalOrder([...items]); // Save current order
    setHasMoved(false);
  };

  const exitEditMode = (shouldSave = false) => {
    if (!shouldSave && hasMoved) {
      setItems(originalOrder); // Restore original order on cancel
    }
    setIsEditMode(false);
    setSelectedIds(new Set());
    setHasMoved(false);
    setOriginalOrder([]);
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

  const handleRemoveConfirm = async () => {
    const newItems = items.filter((item) => !selectedIds.has(item.id));
    setItems(newItems);
    await saveItems(newItems); // Save to storage
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

  const handleNewListCreate = async () => {
    if (newListName.trim()) {
      const allLists = await storage.getLists();
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        items: pendingItemForNewList ? [pendingItemForNewList] : [],
      };

      allLists.push(newList);
      await storage.saveLists(allLists);

      // Track the created list name
      setCreatedListName(newListName.trim());

      // For home.tsx only
      setLists(allLists.map((l) => ({ id: l.id, name: l.name })));

      // Show progress modal
      setShowNewListProgressModal(true);

      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    refreshLists();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isEditMode ? { display: "none" } : { height: 100 },
    });
  }, [isEditMode]);

  useEffect(() => {
    const debugStorage = async () => {
      const lists = await storage.getLists();
    };
    debugStorage();
  }, []);

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

  useFocusEffect(
    React.useCallback(() => {
      const loadAllLists = async () => {
        const allLists = await storage.getLists();
        setLists(allLists.map((l) => ({ id: l.id, name: l.name })));
      };
      loadAllLists();
      loadItems(); // This should reload items each time you navigate back
    }, [selectedList]), // Make sure selectedList is in dependencies
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={componentStyles.container}>
      {/* Header */}
      <View style={componentStyles.headerBar}>
        {isEditMode ? (
          // Edit mode header
          <>
            <View style={componentStyles.headerLeft}>
              {/* Select All circle */}
              <Pressable
                onPress={toggleSelectAll}
                style={({ pressed }) => ({
                  marginRight: 12,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
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

      {/* List Content */}
      {items.length === 0 ? (
        <Text>No items in this list</Text>
      ) : isEditMode ? (
        <DraggableFlatList
          data={items}
          onDragBegin={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onDragEnd={({ data }) => {
            setItems(data);
            setHasMoved(true);
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            componentStyles.listContent,
            { paddingBottom: 220 },
          ]}
          activationDistance={10}
          autoscrollThreshold={80}
          autoscrollSpeed={100}
          renderItem={({ item, drag }) => (
            <Card
              item={item}
              isEditMode={isEditMode}
              isSelected={selectedIds.has(item.id)}
              onLongPress={drag}
              onPress={() => toggleSelect(item.id)}
            />
          )}
        />
      ) : (
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
              onPress={() => toggleSelect(item.id)}
            />
          )}
        />
      )}

      {/* Bottom Cancel / Remove bar and modals stay the same */}

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
          {/* Cancel */}
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              alignItems: "center",
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
            onPress={() => exitEditMode(false)} // Don't save
          >
            <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
          </Pressable>

          <View
            style={{ width: 1, backgroundColor: "#e0e0e0", marginVertical: 12 }}
          />

          {/* Save */}
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              alignItems: "center",
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
            onPress={async () => {
              if (hasMoved) {
                await saveItems(items);
                exitEditMode(true);
              }
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: hasMoved ? "#008CFF" : "#bfbfbf",
              }}
            >
              Save
            </Text>
          </Pressable>

          <View
            style={{ width: 1, backgroundColor: "#e0e0e0", marginVertical: 12 }}
          />

          {/* Remove */}
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              alignItems: "center",
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
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
          </Pressable>
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

            <View style={{ flexDirection: "row", marginVertical: 12 }}>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  alignItems: "center",
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  // opacity: pressed ? 0.7 : 1,
                })}
                onPress={() => setShowRemoveModal(false)}
              >
                <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
              </Pressable>

              <View
                style={{
                  width: 1,
                  backgroundColor: "#e0e0e0",
                  marginVertical: 12,
                }}
              />

              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  alignItems: "center",
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  // opacity: pressed ? 0.7 : 1,
                })}
                onPress={handleRemoveConfirm}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#FF3B30" }}
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={setSearchQuery}
        searchContext={selectedList}
        items={items}
        onItemPress={(item) => {
          if (item.type === "official") {
            router.navigate(`/official/${item.id}`);
          } else {
            router.navigate(`/bill/${item.id}`);
          }
        }}
        onNewListPress={(item) => {
          setPendingItemForNewList(item); // store it
          setNewListContext("search");
          setShowSearchModal(false);
          setTimeout(() => setShowNewListModal(true), 300);
        }}
      />

      {/* Options Modal */}
      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
        selectedListId={currentListId}
        refreshLists={refreshLists}
        setSelectedList={setSelectedList} // ADD THIS
      />

      {/* List Selection Modal */}
      <ListSelection
        showListSelection={showListSelection}
        setShowListSelection={setShowListSelection}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        lists={lists} // ADD THIS
        onNewListPress={() => setShowNewListModal(true)} // ADD THIS
      />
      {/* Edit Options Modal */}
      <EditOptionsModal
        visible={showEditOptions}
        onClose={() => setShowEditOptions(false)}
        onConfirm={handleEditConfirm}
        onNewListPress={() => {
          setNewListContext("main");
          setShowNewListModal(true);
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
              Creating {newListName || "new list"}...
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

function Card({
  item,
  isEditMode,
  isSelected,
  onLongPress,
  onPress,
}: {
  item: ListItem;
  isEditMode: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
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

  // Date formatter
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
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
          {item.type === "bill" ? (
            // Bill icon - check this FIRST
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
              <Image
                source={
                  (item as any).policyArea
                    ? getBillIcon((item as any).policyArea)
                    : getBillIcon()
                }
                style={{ width: "100%", height: "100%", borderRadius: 6 }}
                resizeMode="contain"
              />
            </View>
          ) : (item.photoUrl && !imageError) || item.avatar ? (
            // Official with photo
            <View style={componentStyles.avatar}>
              <Image
                source={item.avatar || { uri: item.photoUrl }}
                style={{
                  width: "100%",
                  height: "120%",
                }}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            </View>
          ) : (
            // Official fallback (initials)
            <View style={componentStyles.avatar}>
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
                  {item.name?.charAt(0) || "?"}
                </Text>
              </View>
            </View>
          )}
          {isEditMode && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 50,
                height: 50,
                borderRadius: 36,
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
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={componentStyles.metaRow}>
              <Text style={componentStyles.subtitle}>{item.party}</Text>
              <Text style={componentStyles.separator}>·</Text>
              <Text style={componentStyles.subtitle} numberOfLines={1}>
                {item.role}
              </Text>
              {item.update ? (
                <>
                  <Text style={componentStyles.separator}>·</Text>
                  <Text style={componentStyles.update}>{item.update}</Text>
                </>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, gap: 4 }}>
            <View style={[componentStyles.metaRow, { flexWrap: "nowrap" }]}>
              <Text
                style={[componentStyles.subtitle, { flexShrink: 0 }]}
                numberOfLines={1}
              >
                {formatDate(item.date)}
              </Text>
              {item.policyArea && (
                <>
                  <Text style={componentStyles.separator}>·</Text>
                  <Text
                    style={[componentStyles.subtitle, { flexShrink: 1 }]}
                    numberOfLines={1}
                  >
                    {item.policyArea}
                  </Text>
                </>
              )}
            </View>
            <Text style={componentStyles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text
              style={[componentStyles.subtitle, { flexShrink: 1 }]}
              numberOfLines={1}
            >
              {item.latestAction}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
