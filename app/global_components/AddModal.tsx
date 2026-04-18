import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { notificationPreferences } from "../utils/notificationPreferences";
import { ListItem, storage } from "../utils/storage";
import { syncPreferencesToBackend } from "../utils/syncPreferences";

interface Props {
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLists: string[];
  setSelectedLists: React.Dispatch<React.SetStateAction<string[]>>;
  onNewListPress: (item?: any) => void;
  listsVersion?: number;
  currentItem?: {
    id: string;
    type: "official" | "bill";
    name: string;
    party?: string;
    role?: string;
    date?: string;
    latestAction?: string;
    policyArea?: string;
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
    maxHeight: 400,
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
  listsVersion,
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
  const [pendingNewList, setPendingNewList] = useState(false);

  // Load available lists from storage
  useEffect(() => {
    const loadLists = async () => {
      // console.log("loadLists called", showAddModal, listsVersion);
      const lists = await storage.getLists();
      const listOptions = lists.map((list) => ({
        id: list.id,
        label: list.name,
      }));
      listOptions.push({ id: "new-list", label: "New List" });
      setAvailableLists(listOptions);

      if (showAddModal && currentItem) {
        const memberListIds = lists
          .filter((list) => list.items.some((i) => i.id === currentItem.id))
          .map((list) => list.id);
        setSelectedLists(memberListIds);
        setInitialSelections(memberListIds);
      }
    };

    loadLists();
  }, [showAddModal, listsVersion]);

  const selectedListLabels = availableLists
    .filter((opt) => selectedLists.includes(opt.id) && opt.id !== "new-list")
    .map((opt) => opt.label);

  const removedListLabels = availableLists
    .filter(
      (opt) =>
        initialSelections.includes(opt.id) && !selectedLists.includes(opt.id),
    )
    .map((opt) => opt.label);

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

      for (const listId of listsToRemove) {
        const list = lists.find((l) => l.id === listId);
        if (list) {
          list.items = list.items.filter((item) => item.id !== currentItem.id);
        }
      }

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
              latestAction: currentItem.latestAction,
              policyArea: currentItem.policyArea,
              update: "",
              photoUrl: currentItem.photoUrl,
            };
            list.items.unshift(listItem);
          }
        }
      }

      await storage.saveLists(lists);
      listEvents.emit(LIST_UPDATED);

      // Auto-enable notifications for newly added items
      if (currentItem && listsToAdd.length > 0) {
        const prefId =
          currentItem.type === "bill"
            ? `bill_${currentItem.id}`
            : `official_${currentItem.id}`;
        const existing = notificationPreferences.getSubTypes(prefId);
        if (existing.length === 0) {
          notificationPreferences.saveSubTypes(prefId, currentItem.type, [
            "all-notications",
          ]);
          syncPreferencesToBackend();
        }
      }

      // Auto-disable notifications if removed from ALL lists
      if (currentItem && listsToRemove.length > 0) {
        const updatedLists = storage.getLists();
        const stillInAnyList = updatedLists.some((l) =>
          l.items.some((i) => i.id === currentItem.id),
        );
        const prefId =
          currentItem.type === "bill"
            ? `bill_${currentItem.id}`
            : `official_${currentItem.id}`;
        Alert.alert(
          "Debug",
          `stillInAnyList: ${stillInAnyList}, prefId: ${prefId}`,
        );
        console.log("listsToRemove:", listsToRemove);
        console.log("stillInAnyList:", stillInAnyList);
        console.log("prefId:", prefId);
        if (!stillInAnyList) {
          notificationPreferences.disable(prefId);
          console.log("disable called for:", prefId);
          syncPreferencesToBackend();
        }
      }
    }

    setPendingNewList(hasNewList);

    closeModal();

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
    } else if (hasNewList) {
      setTimeout(() => onNewListPress(currentItem), 200);
    }
  };

  // Keep the simple progress animation (no saving in here)
  useEffect(() => {
    if (!showConfirmModal) return;
    const timer = setTimeout(() => {
      setShowConfirmModal(false);
      if (pendingNewList) {
        setPendingNewList(false);
        setTimeout(() => onNewListPress(currentItem), 200);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [showConfirmModal]);

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
        <Pressable
          style={[modalStyles.modalOverlay, { justifyContent: "center" }]}
          onPress={closeModal}
        >
          <View style={{ width: "100%" }}>
            <ScrollView
              style={modalStyles.dropdownAdd}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <Text style={modalStyles.dropdownItemTextLabel}>
                Add or Remove from Lists
              </Text>
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

      {/* Confirmation Toast */}
      {showConfirmModal && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              backgroundColor: "#535353",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: "#fff", fontWeight: "500" }}>
              {isRemoving
                ? `Removed from ${activeListLabels[0]}`
                : `Added to ${activeListLabels[0]}`}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}
