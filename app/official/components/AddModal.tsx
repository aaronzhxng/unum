import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/components"; // Adjust path as needed

interface Props {
  showAddModal: boolean;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedLists: string;
  setSelectedLists: React.Dispatch<React.SetStateAction<string>>;
}

const listOptions = [
  { id: "most-viewed", label: "Most Viewed" },
  { id: "most-recent-action", label: "Most Recent Action" },
  { id: "newest-first", label: "Newest First" },
  { id: "oldest-first", label: "Oldest First" },
];

export default function AddModal({
  showAddModal,
  setShowAddModal,
  selectedLists,
  setSelectedLists,
}: Props) {
  const closeModal = () => setShowAddModal(false);

  const toggleList = (id: string) => {
    setSelectedLists(id); // Single select logic preserved
  };

  const handleApply = () => {
    closeModal();
    // Add any onApply logic here if needed
  };

  return showAddModal ? (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={closeModal}
    >
      <Pressable style={styles.modalOverlay} onPress={closeModal}>
        <View style={{ padding: 0, minHeight: 400 }}>
          {/* Section Header */}
          <View style={styles.dropdown}>
            <Text style={styles.dropdownItemText}>Sort Lists</Text>
          </View>

          {/* Scrollable Checkboxes */}
          <ScrollView
            style={{ maxHeight: 200 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
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
                <Text style={styles.dropdownItemText}>{option.label}</Text>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    backgroundColor:
                      selectedLists === option.id ? "#008CFF" : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedLists === option.id && (
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
                // styles.actionButton,
                { backgroundColor: "#f5f5f5" },
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
                // styles.actionButton,
                { backgroundColor: "#00AFFF" },
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              onPress={handleApply}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}
              >
                Results
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  ) : null;
}
