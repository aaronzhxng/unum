import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

interface Props {
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLists: string[];
  setSelectedLists: React.Dispatch<React.SetStateAction<string[]>>;
}

const listOptions = [
  { id: "my-list", label: "My List" },
  { id: "tri-state-area", label: "Tri State Area" },
  { id: "swing-states", label: "Swing States" },
  { id: "new-list", label: "New List" },
];

// Inline styles to avoid path dependencies
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
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentListIndex, setCurrentListIndex] = useState(0);
  const [initialSelections, setInitialSelections] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);

  const selectedListLabels = listOptions
    .filter((opt) => selectedLists.includes(opt.id))
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
    setSelectedLists((prev: string[]) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApply = () => {
    const hasRemovals = removedListLabels.length > 0;
    const hasAdditions = selectedLists.some(
      (id) => !initialSelections.includes(id),
    );

    if (!hasRemovals && !hasAdditions) {
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
          selectedLists.some((id) => !initialSelections.includes(id))
        ) {
          setTimeout(() => {
            setIsRemoving(false);
            setProgress(0);
            setCurrentListIndex(0);
          }, 300);
        } else {
          // All done
          setTimeout(() => {
            setShowConfirmModal(false);
            setProgress(0);
            setCurrentListIndex(0);
            setIsRemoving(false);
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
        <Pressable style={modalStyles.modalOverlay} onPress={closeModal}>
          <View style={{ padding: 0, minHeight: 400 }}>
            <ScrollView
              style={modalStyles.dropdownAdd}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <Text style={modalStyles.dropdownItemTextLabel}>Add to List</Text>
              {listOptions.map((option) => (
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
                marginBottom: 16,
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
                marginBottom: 16,
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
    </>
  );
}
