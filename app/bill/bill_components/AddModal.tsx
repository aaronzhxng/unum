import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLists: string[];
  setSelectedLists: React.Dispatch<React.SetStateAction<string[]>>;
  onNewListPress: () => void;
}

const listOptions = [
  { id: "my-list", label: "My List" },
  { id: "tri-state-area", label: "Tri State Area" },
  { id: "swing-states", label: "Swing States" },
  { id: "new-list", label: "New List" },
];

export default function AddModal({
  showAddModal,
  setShowAddModal,
  selectedLists,
  setSelectedLists,
  onNewListPress,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentListIndex, setCurrentListIndex] = useState(0);
  const [initialSelections, setInitialSelections] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);

  const selectedListLabels = listOptions
    .filter((opt) => selectedLists.includes(opt.id) && opt.id !== "new-list")
    .map((opt) => opt.label);

  const removedListLabels = listOptions
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
  };

  const toggleList = (id: string) => {
    // Just toggle selection - modal will open after Confirm if needed
    setSelectedLists((prev: string[]) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApply = () => {
    const hasRemovals = removedListLabels.length > 0;
    const hasNewList = selectedLists.includes("new-list");
    const hasExistingAdditions = selectedLists.some(
      (id) => id !== "new-list" && !initialSelections.includes(id),
    );

    // If ONLY "New List" is selected, open modal immediately
    if (hasNewList && !hasRemovals && !hasExistingAdditions) {
      closeModal();
      setTimeout(() => onNewListPress(), 200);
      return;
    }

    // If no changes at all
    if (!hasRemovals && !hasExistingAdditions && !hasNewList) {
      closeModal();
      return;
    }

    closeModal();

    // Show removal progress first if there are removals
    if (hasRemovals) {
      setIsRemoving(true);
      setShowConfirmModal(true);
      setProgress(0);
      setCurrentListIndex(0);
    } else {
      setIsRemoving(false);
      setShowConfirmModal(true);
      setProgress(0);
      setCurrentListIndex(0);
    }
  };

  // Animate progress bar
  useEffect(() => {
    if (!showConfirmModal) return;

    const activeList = isRemoving ? removedListLabels : selectedListLabels;
    const totalLists = activeList.length;
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

        // If we just finished removing and there are additions, switch to adding
        if (
          isRemoving &&
          selectedLists.some(
            (id) => id !== "new-list" && !initialSelections.includes(id),
          )
        ) {
          setTimeout(() => {
            setIsRemoving(false);
            setProgress(0);
            setCurrentListIndex(0);
          }, 300);
        } else {
          // All done with progress
          setTimeout(() => {
            setShowConfirmModal(false);
            setProgress(0);
            setCurrentListIndex(0);
            setIsRemoving(false);

            // If "New List" was selected, open the name modal now
            if (selectedLists.includes("new-list")) {
              setTimeout(() => onNewListPress(), 200);
            }
          }, 300);
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [
    showConfirmModal,
    isRemoving,
    selectedListLabels.length,
    removedListLabels.length,
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
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View style={{ padding: 0, minHeight: 400 }}>
            <ScrollView
              style={styles.dropdownAdd}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.dropdownItemTextLabel}>Add to List</Text>
              {listOptions.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.dropdownItem,
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
                      styles.dropdownItemText,
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
                  styles.actionButton,
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
                  styles.actionButton,
                  { backgroundColor: "#00AFFF" },
                  { transform: pressed ? [{ scale: 0.96 }] : [] },
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
          style={[styles.modalOverlay, { justifyContent: "center" }]}
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
                ? removedListLabels.length > 1
                  ? `Removing from ${removedListLabels[currentListIndex]}`
                  : `Removing from ${removedListLabels[0]}`
                : selectedListLabels.length > 1
                  ? `Add to ${selectedListLabels[currentListIndex]}`
                  : `Add to ${selectedListLabels[0]}`}
            </Text>

            {/* Progress Bar */}
            <View
              style={{
                width: "100%",
                height: 6,
                backgroundColor: "#e0e0e0",
                borderRadius: 3,
                marginBottom: 16,
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
                {currentListIndex + 1}/
                {isRemoving
                  ? removedListLabels.length
                  : selectedListLabels.length}
              </Text>
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {Math.round(progress)}%
              </Text>
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={() => {
                setShowConfirmModal(false);
                setProgress(0);
              }}
              style={({ pressed }) => [
                styles.actionButton,
                { transform: pressed ? [{ scale: 0.96 }] : [] },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#535353",
                  textAlign: "center",
                  marginLeft: -16,
                }}
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
