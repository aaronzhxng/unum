import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";

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

export default function AddModal({
  showAddModal,
  setShowAddModal,
  selectedLists,
  setSelectedLists,
}: Props) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentListIndex, setCurrentListIndex] = useState(0);

  const selectedListLabels = listOptions
    .filter((opt) => selectedLists.includes(opt.id))
    .map((opt) => opt.label);

  const closeModal = () => setShowAddModal(false);

  const toggleList = (id: string) => {
    setSelectedLists((prev: string[]) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleApply = () => {
    if (selectedLists.length === 0) {
      closeModal();
      return;
    }

    closeModal();
    setShowConfirmModal(true);
    setProgress(0);
    setCurrentListIndex(0);
  };

  // Animate progress bar
  useEffect(() => {
    if (!showConfirmModal) return;

    const totalLists = selectedListLabels.length;
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 2; // Increment by 2% each tick
      setProgress(currentProgress);

      // Update current list index based on progress
      const newListIndex = Math.floor((currentProgress / 100) * totalLists);
      if (newListIndex < totalLists) {
        setCurrentListIndex(newListIndex);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowConfirmModal(false);
          setProgress(0);
          setCurrentListIndex(0);
        }, 300);
      }
    }, 30); // Update every 30ms for smooth animation

    return () => clearInterval(interval);
  }, [showConfirmModal, selectedListLabels.length]);

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
                  pressed && { transform: [{ scale: 0.96 }] },
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
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
                onPress={handleApply}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}
                >
                  Add
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
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {selectedListLabels.length > 1
                ? `Add to ${selectedListLabels[currentListIndex]}`
                : `Add to ${selectedListLabels[0]}`}
            </Text>

            {/* Progress Bar Background */}
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
              {/* Progress Bar Fill */}
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
                {currentListIndex + 1}/{selectedListLabels.length}
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
