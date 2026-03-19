import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useTabBar } from "../context/TabBarContext";
import { useTour } from "../context/TourContext";
import EditOptionsModal from "../global_components/EditOptionsModal";
import ListSelection from "../global_components/ListSelection";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import OptionsModal from "../global_components/OptionsModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import { getBillIcon } from "../utils/billIcons";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { ListItem, storage } from "../utils/storage";
// type ItemType = "official" | "bill";

type Item = ListItem;

export default function HomeScreen() {
  const flatListRef = useRef<View>(null);
  const listDropdownRef = useRef<View>(null);
  const { isActive, currentStep, setTargetLayout, markAppReady } = useTour();
  // console.log("HomeScreen render:", Date.now());
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
  const [pendingEditAction, setPendingEditAction] = useState<
    "copy" | "move" | null
  >(null);

  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

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
  // const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [createdListName, setCreatedListName] = useState("");

  const [hasMoved, setHasMoved] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<ListItem[]>([]);

  const [lists, setLists] = useState<Array<{ id: string; name: string }>>([]);
  // const [currentList, setCurrentList] = useState<UserList | null>(null);

  const [currentListId, setCurrentListId] = useState<string>("");
  const [notifVersion, setNotifVersion] = useState(0);

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

  const handleEditConfirm = async (
    action: "copy" | "move",
    listIds: string[],
  ) => {
    const selectedItems = items.filter((item) => selectedIds.has(item.id));
    const allLists = await storage.getLists();

    for (const listId of listIds) {
      const targetList = allLists.find((l) => l.id === listId);
      if (!targetList) continue;

      // Add items that aren't already in the target list
      for (const item of selectedItems) {
        const alreadyExists = targetList.items.some((i) => i.id === item.id);
        if (!alreadyExists) {
          targetList.items.push(item);
        }
      }
    }

    // If moving, remove from current list
    if (action === "move") {
      const currentList = allLists.find((l) => l.id === currentListId);
      if (currentList) {
        currentList.items = currentList.items.filter(
          (item) => !selectedIds.has(item.id),
        );
      }
      setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    }

    await storage.saveLists(allLists);
    setShowEditOptions(false);
    exitEditMode();
  };

  const handleNewListCreate = async () => {
    if (newListName.trim()) {
      const allLists = await storage.getLists();

      let itemsForNewList: ListItem[] = [];
      if (Array.isArray(pendingItemForNewList)) {
        // Edit mode: multiple selected items
        itemsForNewList = pendingItemForNewList;
      } else if (pendingItemForNewList) {
        // Single item from search modal or detail screen
        itemsForNewList = [pendingItemForNewList];
      }

      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        items: itemsForNewList,
      };

      allLists.push(newList);
      await storage.saveLists(allLists);

      // If move, remove from current list
      if (newListContext === "main" && pendingEditAction === "move") {
        const movedIds = new Set(itemsForNewList.map((i) => i.id));
        const updatedLists = await storage.getLists();
        const currentList = updatedLists.find((l) => l.id === currentListId);
        if (currentList) {
          currentList.items = currentList.items.filter(
            (item) => !movedIds.has(item.id),
          );
          await storage.saveLists(updatedLists);
          setItems((prev) => prev.filter((item) => !movedIds.has(item.id)));
        }
        exitEditMode();
      }

      setCreatedListName(newListName.trim());
      setLists(allLists.map((l) => ({ id: l.id, name: l.name })));
      setShowNewListProgressModal(true);
      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
      setPendingEditAction(null);
    }
  };

  const { setTabBarHidden } = useTabBar();

  useEffect(() => {
    refreshLists();
  }, []);

  useEffect(() => {
    setTabBarHidden(isEditMode);
  }, [isEditMode]);

  // useEffect(() => {
  //   const debugStorage = async () => {
  //     const lists = await storage.getLists();
  //   };
  //   debugStorage();
  // }, []);

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

  useEffect(() => {
    const reload = () => {
      const beforeIds = new Set(items.map((i) => i.id));
      refreshLists().then(async () => {
        const allLists = await storage.getLists();
        const currentList =
          allLists.find((l) => l.name === selectedList) || allLists[0];
        if (currentList) {
          const added = currentList.items
            .filter((i) => !beforeIds.has(i.id))
            .map((i) => i.id);
          if (added.length > 0) {
            setNewItemIds((prev) => new Set([...prev, ...added]));
            setTimeout(() => setNewItemIds(new Set()), 10000);
          }
        }
      });
    };
    listEvents.on(LIST_UPDATED, reload);
    return () => {
      listEvents.off(LIST_UPDATED, reload);
    };
  }, [selectedList, items]);

  useEffect(() => {
    if (isActive && currentStep === 0) {
      setTimeout(() => {
        listDropdownRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
    if (isActive && currentStep === 1) {
      setTimeout(() => {
        flatListRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isLoading && items !== undefined) {
      markAppReady();
    }
  }, [isLoading]);

  useFocusEffect(
    React.useCallback(() => {
      // console.log("HomeScreen focused:", Date.now());
      const loadAllLists = async () => {
        const allLists = await storage.getLists();
        setLists(allLists.map((l) => ({ id: l.id, name: l.name })));
        const currentList =
          allLists.find((l) => l.name === selectedList) || allLists[0];
        if (currentList) {
          setCurrentListId(currentList.id);
          setItems((prev) => {
            const newItems = currentList.items;
            if (
              prev.length === newItems.length &&
              prev.every((item, i) => item.id === newItems[i].id)
            ) {
              return prev;
            }
            return newItems;
          });
        }
        setIsLoading(false);
      };
      loadAllLists();

      return () => {
        setNewItemIds(new Set());
      };
    }, [selectedList]),
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
                  ref={listDropdownRef}
                  collapsable={false}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  onLayout={() => {
                    if (isActive && currentStep === 0) {
                      setTimeout(() => {
                        listDropdownRef.current?.measureInWindow(
                          (x, y, width, height) => {
                            setTargetLayout({ x, y, width, height });
                          },
                        );
                      }, 100);
                    }
                  }}
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 16 }}>📋</Text>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#1a1a1a",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Your list is empty
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#7B7C81",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Add from the Officials and Legislation tabs to start tracking what
            matters to you.
          </Text>
        </View>
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
          keyExtractor={(item, index) => item.id || index.toString()}
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
              isNew={newItemIds.has(item.id)}
              onLongPress={drag}
              onPress={() => toggleSelect(item.id)}
            />
          )}
          directionalLockEnabled={true}
        />
      ) : (
        <View
          ref={flatListRef}
          collapsable={false}
          style={{ flex: 1 }}
          onLayout={() => {
            if (isActive && currentStep === 1) {
              setTimeout(() => {
                flatListRef.current?.measureInWindow((x, y, width, height) => {
                  setTargetLayout({ x, y, width, height });
                });
              }, 100);
            }
          }}
        >
          <FlatList
            data={items}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={componentStyles.listContent}
            renderItem={({ item }) => (
              <Card
                item={item}
                isEditMode={isEditMode}
                isSelected={selectedIds.has(item.id)}
                isNew={newItemIds.has(item.id)}
                onLongPress={() => enterEditMode(item.id)}
                onPress={() => toggleSelect(item.id)}
              />
            )}
            directionalLockEnabled={true}
          />
        </View>
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
        setSelectedList={setSelectedList}
        onNotifVersionChange={() => setNotifVersion((v) => v + 1)}
      />

      {/* List Selection Modal */}
      <ListSelection
        showListSelection={showListSelection}
        setShowListSelection={setShowListSelection}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        lists={lists}
        onNewListPress={() => setShowNewListModal(true)}
        notifVersion={notifVersion}
      />
      {/* Edit Options Modal */}
      <EditOptionsModal
        visible={showEditOptions}
        onClose={() => setShowEditOptions(false)}
        onConfirm={handleEditConfirm}
        onNewListPress={(action) => {
          setPendingEditAction(action);
          setPendingItemForNewList(
            items.filter((item) => selectedIds.has(item.id)),
          );
          setNewListContext("main");
          setShowNewListModal(true);
        }}
        availableLists={lists.filter((l) => l.id !== currentListId)}
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

const POLICY_AREA_COLORS: Record<string, string> = {
  "Agriculture and Food": "#7CB342",
  Animals: "#8D6E63",
  "Armed Forces and National Security": "#455A64",
  "Arts, Culture, Religion": "#AB47BC",
  "Civil Rights and Liberties, Minority Issues": "#E53935",
  Commerce: "#00ACC1",
  Congress: "#1565C0",
  "Crime and Law Enforcement": "#424242",
  "Economics and Public Finance": "#4CAF82",
  Education: "#F5A623",
  "Emergency Management": "#FF5722",
  Energy: "#E67E22",
  "Environmental Protection": "#43A047",
  Families: "#F06292",
  "Finance and Financial Sector": "#4CAF82",
  "Foreign Trade and International Finance": "#9B59B6",
  "Government Operations and Politics": "#6B7FD4",
  Health: "#E53935",
  "Housing and Community Development": "#FF8F00",
  Immigration: "#00897B",
  "International Affairs": "#1E88E5",
  "Labor and Employment": "#6D4C41",
  Law: "#546E7A",
  "Native Americans": "#BF360C",
  "Public Lands and Natural Resources": "#27AE60",
  "Science, Technology, Communications": "#0288D1",
  "Social Welfare": "#E91E8C",
  "Sports and Recreation": "#00BCD4",
  Taxation: "#F9A825",
  "Transportation and Public Works": "#5C6BC0",
  "Water Resources Development": "#0277BD",
};

function formatRole(
  chamber: string,
  state: string,
  district?: number | null,
): string {
  if (chamber === "House of Representatives") {
    const full = `Representative, ${state}${district ? `, District ${district}` : ""}`;
    const abbr = `Rep, ${state}${district ? `, District ${district}` : ""}`;
    return full.length > 39 ? abbr : full;
  }
  const full = `Senator, ${state}`;
  const abbr = `Sen, ${state}`;
  return full.length > 40 ? abbr : full;
}

const Card = React.memo(function Card({
  item,
  isEditMode,
  isSelected,
  isNew,
  onLongPress,
  onPress,
}: {
  item: ListItem;
  isEditMode: boolean;
  isSelected: boolean;
  isNew?: boolean;
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
        borderRadius: 48,
      })}
    >
      <View
        style={[
          componentStyles.officialCard,
          {
            borderWidth: 2,
            borderColor: isNew ? "#96c8ff" : "transparent",
          },
        ]}
      >
        {/* Official avatar column */}
        {item.type === "bill" ? null : (
          <View
            style={{
              width: 64,
              height: 50,
              marginRight: 12,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                overflow: "hidden",
                backgroundColor: "#eee",
              }}
            >
              {(item.photoUrl && !imageError) || item.avatar ? (
                <Image
                  source={item.avatar || { uri: item.photoUrl }}
                  style={{ width: "100%", height: "120%" }}
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
                    {item.name?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
            </View>
            {isEditMode && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 7,
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: isSelected ? "#008CFF" : "rgba(0,0,0,0.15)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isSelected && <Check size={24} color="white" />}
              </View>
            )}
          </View>
        )}

        {isOfficial ? (
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.name} numberOfLines={1}>
              {item.name?.includes(",")
                ? item.name
                    .split(",")
                    .reverse()
                    .map((s: string) => s.trim())
                    .join(" ")
                : item.name}
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
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            {/* Left column: badge + icon */}
            <View
              style={{
                alignItems: "center",
                flexShrink: 0,
                width: 64,
                marginRight: 12,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    POLICY_AREA_COLORS[(item as any).policyArea] ?? "#008CFF",
                  borderRadius: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  marginBottom: 6,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}
                  numberOfLines={1}
                >
                  {item.name?.split(" - ")[0] ?? item.name}
                </Text>
              </View>
              <View style={{ width: 50, height: 50, borderRadius: 6 }}>
                <Image
                  source={
                    (item as any).policyArea
                      ? getBillIcon((item as any).policyArea)
                      : getBillIcon()
                  }
                  style={{ width: 50, height: 50, borderRadius: 6 }}
                  resizeMode="contain"
                />
                {isEditMode && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: isSelected
                        ? "#008CFF"
                        : "rgba(0,0,0,0.15)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isSelected && <Check size={24} color="white" />}
                  </View>
                )}
              </View>
            </View>

            {/* Info */}
            <View
              style={{
                flex: 1,
                alignSelf: "stretch",
                justifyContent: "space-between",
              }}
            >
              {/* Date + policy area */}
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={[componentStyles.subtitle, { flexShrink: 0 }]}
                    numberOfLines={1}
                  >
                    {formatDate(item.date)}
                  </Text>
                  {(item as any).policyArea && (
                    <>
                      <Text style={componentStyles.separator}>·</Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color:
                            POLICY_AREA_COLORS[(item as any).policyArea] ??
                            "#008CFF",
                          fontWeight: "600",
                          flexShrink: 1,
                        }}
                        numberOfLines={1}
                      >
                        {(item as any).policyArea}
                      </Text>
                    </>
                  )}
                </View>
                {/* Descriptive title only — strip the HR.123 prefix */}
                <Text style={componentStyles.name} numberOfLines={2}>
                  {item.name?.includes(" - ")
                    ? item.name.split(" - ").slice(1).join(" - ")
                    : item.name}
                </Text>
              </View>

              {/* Latest action pinned to bottom */}
              <Text style={componentStyles.subtitle} numberOfLines={1}>
                {typeof item.latestAction === "string"
                  ? item.latestAction
                  : ((item.latestAction as any)?.text ?? "")}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
});
