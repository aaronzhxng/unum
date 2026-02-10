import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles"; // Adjust path as needed

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
  const closeModal = () => setShowAddModal(false);

  const toggleList = (id: string) => {
    setSelectedLists((prev: string[]) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
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
                    option.id === "new-list" && { color: "#999" }, // Gray for new-list
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
  ) : null;
}
