import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { ListItem, storage } from "../utils/storage";

interface Props {
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLists: string[];
  setSelectedLists: React.Dispatch<React.SetStateAction<string[]>>;
  onNewListPress: (item?: any) => void; // Add item parameter
  currentItem?: {
    id: string;
    type: "official" | "bill";
    name: string;
    party?: string;
    role?: string;
    date?: string;
    committee?: string;
    photoUrl?: string;
  };
}

// Inline styles
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdownAdd: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    margin: 16,
    marginTop: 280,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000000",
  },
  dropdownItemTextLabel: {
    fontSize: 16,
    color: "#7B7C81",
    marginTop: 16,
    marginBottom: 6,
    marginHorizontal: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    marginLeft: 16,
  },
};

export default function AddModal({
  showAddModal,
  setShowAddModal,
  selectedLists,
  setSelectedLists,
  onNewListPress,
  currentItem,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentListIndex, setCurrentListIndex] = useState(0);
  const [initialSelections, setInitialSelections] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [availableLists, setAvailableLists] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [activeListLabels, setActiveListLabels] = useState<string[]>([]);

  // Load available lists from storage
  useEffect(() => {
    const loadLists = async () => {
      const lists = await storage.getLists();
      const listOptions = lists.map((list) => ({
        id: list.id,
        label: list.name,
      }));
      listOptions.push({ id: "new-list", label: "New List" });
      setAvailableLists(listOptions);
    };

    if (showAddModal) {
      loadLists();
    }
  }, [showAddModal]);

  const selectedListLabels = availableLists
    .filter((opt) => selectedLists.includes(opt.id) && opt.id !== "new-list")
    .map((opt) => opt.label);

  const removedListLabels = availableLists
    .filter(
      (opt) =>
        initialSelections.includes(opt.id) && !selectedLists.includes(opt.id),
    )
    .map((opt) => opt.label);

  // Track initial selections when modal opens
  useEffect(() => {
    if (showAddModal) {
      setInitialSelections([...selectedLists]);
    }
  }, [showAddModal]);

  const closeModal = () => {
    setShowAddModal(false);
    setIsRemoving(false);
    setSelectedLists([]);
  };

  const toggleList = (id: string) => {
    setSelectedLists((prev: string[]) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const [savedChanges, setSavedChanges] = useState<{
    listsToAdd: string[];
    listsToRemove: string[];
  } | null>(null);

  const handleApply = async () => {
    const hasRemovals = removedListLabels.length > 0;
    const hasNewList = selectedLists.includes("new-list");
    const hasExistingAdditions = selectedLists.some(
      (id) => id !== "new-list" && !initialSelections.includes(id),
    );

    if (hasNewList && !hasRemovals && !hasExistingAdditions) {
      closeModal();
      setTimeout(() => onNewListPress(currentItem), 200); // Pass currentItem
      return;
    }

    if (!hasRemovals && !hasExistingAdditions && !hasNewList) {
      closeModal();
      return;
    }

    // Track what we're about to change
    const listsToRemove = initialSelections.filter(
      (id) => !selectedLists.includes(id) && id !== "new-list",
    );
    const listsToAdd = selectedLists.filter(
      (id) => !initialSelections.includes(id) && id !== "new-list",
    );

    setSavedChanges({ listsToAdd, listsToRemove });

    // SAVE TO STORAGE
    if (currentItem) {
      const lists = await storage.getLists();

      // Remove from lists
      for (const listId of listsToRemove) {
        const list = lists.find((l) => l.id === listId);
        if (list) {
          list.items = list.items.filter((item) => item.id !== currentItem.id);
        }
      }

      // Add to lists
      for (const listId of listsToAdd) {
        const list = lists.find((l) => l.id === listId);
        if (list) {
          const alreadyExists = list.items.some((i) => i.id === currentItem.id);
          if (!alreadyExists) {
            const listItem: ListItem = {
              id: currentItem.id,
              type: currentItem.type,
              name: currentItem.name,
              party: currentItem.party,
              role: currentItem.role,
              date: currentItem.date,
              committee: currentItem.committee,
              update: "",
              photoUrl: currentItem.photoUrl,
            };
            list.items.push(listItem);
          }
        }
      }

      await storage.saveLists(lists);
    }

    closeModal();

    // Show progress
    if (hasRemovals && removedListLabels.length > 0) {
      setActiveListLabels(removedListLabels);
      setIsRemoving(true);
      setShowConfirmModal(true);
      setProgress(0);
      setCurrentListIndex(0);
    } else if (hasExistingAdditions && selectedListLabels.length > 0) {
      setActiveListLabels(selectedListLabels);
      setIsRemoving(false);
      setShowConfirmModal(true);
      setProgress(0);
      setCurrentListIndex(0);
    }
  };

  // Keep the simple progress animation (no saving in here)
  useEffect(() => {
    if (!showConfirmModal) return;

    const totalLists = activeListLabels.length;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      const newListIndex = Math.floor((currentProgress / 100) * totalLists);
      if (newListIndex < totalLists) {
        setCurrentListIndex(newListIndex);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);

        if (
          isRemoving &&
          selectedLists.some(
            (id) => id !== "new-list" && !initialSelections.includes(id),
          )
        ) {
          setTimeout(() => {
            setActiveListLabels(selectedListLabels);
            setIsRemoving(false);
            setProgress(0);
            setCurrentListIndex(0);
          }, 300);
        } else {
          setTimeout(() => {
            setShowConfirmModal(false);
            setProgress(0);
            setCurrentListIndex(0);
            setIsRemoving(false);

            if (selectedLists.includes("new-list")) {
              setTimeout(() => onNewListPress(currentItem), 200); // Pass currentItem
            }
          }, 300);
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [
    showConfirmModal,
    isRemoving,
    activeListLabels.length,
    selectedLists,
    initialSelections,
    selectedListLabels,
  ]);

  return (
    <>
      {/* Main Add Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <Pressable style={modalStyles.modalOverlay} onPress={closeModal}>
          <View style={{ padding: 0, minHeight: 400 }}>
            <ScrollView
              style={modalStyles.dropdownAdd}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <Text style={modalStyles.dropdownItemTextLabel}>Add to List</Text>
              {availableLists.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    modalStyles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => toggleList(option.id)}
                >
                  <Text
                    style={[
                      modalStyles.dropdownItemText,
                      option.id === "new-list" && { color: "#7B7C81" },
                    ]}
                  >
                    {option.label}
                  </Text>

                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: selectedLists.includes(option.id)
                        ? "#008CFF"
                        : "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedLists.includes(option.id)
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedLists.includes(option.id) && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#008CFF",
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={({ pressed }) => [
                  modalStyles.actionButton,
                  { backgroundColor: "#fafafa" },
                  { transform: pressed ? [{ scale: 0.96 }] : [] },
                ]}
                onPress={closeModal}
              >
                <Text
                  style={{ color: "#535353", fontWeight: "500", fontSize: 16 }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  modalStyles.actionButton,
                  { backgroundColor: "#00AFFF" },
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
                onPress={handleApply}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}
                >
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Confirmation Modal with Progress */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={[modalStyles.modalOverlay, { justifyContent: "center" }]}
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
              {isRemoving
                ? activeListLabels.length > 1
                  ? `Removing from ${activeListLabels[currentListIndex] || activeListLabels[0]}`
                  : `Removing from ${activeListLabels[0]}`
                : activeListLabels.length > 1
                  ? `Adding to ${activeListLabels[currentListIndex] || activeListLabels[0]}`
                  : `Adding to ${activeListLabels[0]}`}
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
                  width: `${progress}%`,
                  height: "100%",
                  backgroundColor: "#00AFFF",
                  borderRadius: 3,
                }}
              />
            </View>

            {/* Progress Text */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 0,
              }}
            >
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {currentListIndex + 1}/{activeListLabels.length}
              </Text>
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {Math.round(progress)}%
              </Text>
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={async () => {
                // Undo the save
                if (savedChanges && currentItem) {
                  const lists = await storage.getLists();

                  // Re-add to lists we removed from
                  for (const listId of savedChanges.listsToRemove) {
                    const list = lists.find((l) => l.id === listId);
                    if (list) {
                      const alreadyExists = list.items.some(
                        (i) => i.id === currentItem.id,
                      );
                      if (!alreadyExists) {
                        const listItem: ListItem = {
                          id: currentItem.id,
                          type: currentItem.type,
                          name: currentItem.name,
                          party: currentItem.party,
                          role: currentItem.role,
                          date: currentItem.date,
                          committee: currentItem.committee,
                          update: "",
                          photoUrl: currentItem.photoUrl,
                        };
                        list.items.push(listItem);
                      }
                    }
                  }

                  // Remove from lists we added to
                  for (const listId of savedChanges.listsToAdd) {
                    const list = lists.find((l) => l.id === listId);
                    if (list) {
                      list.items = list.items.filter(
                        (item) => item.id !== currentItem.id,
                      );
                    }
                  }

                  await storage.saveLists(lists);
                }

                setShowConfirmModal(false);
                setProgress(0);
                setSavedChanges(null);
              }}
            >
              <Text
                style={{ fontSize: 14, color: "#535353", textAlign: "center" }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
