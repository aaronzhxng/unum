import { Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "../global_styles/styles";

interface Props {
  showListSelection: boolean;
  setShowListSelection: React.Dispatch<React.SetStateAction<boolean>>;
  selectedList: string;
  setSelectedList: React.Dispatch<React.SetStateAction<string>>;
}

const LIST_OPTIONS = [
  { id: "my-list", label: "My List" },
  { id: "tri-state", label: "Tri State Area" },
  { id: "swing-states", label: "Swing States" },
  { id: "new-list", label: "New List", isNew: true },
];

export default function ListSelection({
  showListSelection,
  setShowListSelection,
  selectedList,
  setSelectedList,
}: Props) {
  const [showNameModal, setShowNameModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleListSelect = (option: {
    id: string;
    label: string;
    isNew?: boolean;
  }) => {
    if (option.isNew) {
      // Open name input modal for New List
      setShowListSelection(false);
      setShowNameModal(true);
    } else {
      setSelectedList(option.label);
      setShowListSelection(false);
    }
  };

  const handleNameConfirm = () => {
    if (newListName.trim()) {
      setSelectedList(newListName.trim());
      setNewListName("");
      setShowNameModal(false);
    }
  };

  const handleNameCancel = () => {
    setNewListName("");
    setShowNameModal(false);
    Keyboard.dismiss();
  };

  return (
    <>
      {/* List Selection Modal */}
      <Modal
        visible={showListSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowListSelection(false)}
        statusBarTranslucent={true}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowListSelection(false)}
        >
          <View style={styles.dropdown}>
            {LIST_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={({ pressed }) =>
                  pressed ? styles.dropdownItemPressed : styles.dropdownItem
                }
                onPress={() => handleListSelect(option)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      option.isNew && { color: "#7B7C81" },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedList === option.label && (
                    <Check size={20} color="#008CFF" strokeWidth={4} />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* New List Name Input Modal */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleNameCancel}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={handleNameCancel}>
            <Pressable onPress={() => {}}>
              <View style={styles.subModalCard}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: 16,
                  }}
                >
                  New List
                </Text>

                <TextInput
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#535353",
                    fontSize: 15,
                    color: "#1a1a1a",
                    paddingVertical: 6,
                    marginBottom: 4,
                  }}
                  placeholder="List name"
                  placeholderTextColor="#adb5bd"
                  value={newListName}
                  onChangeText={setNewListName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleNameConfirm}
                />

                <View style={styles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      { transform: pressed ? [{ scale: 0.96 }] : [] },
                    ]}
                    onPress={handleNameCancel}
                  >
                    <Text style={{ fontSize: 16, color: "#535353" }}>
                      Cancel
                    </Text>
                  </Pressable>

                  <View style={styles.verticalDivider} />

                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      {
                        transform:
                          pressed && newListName.trim()
                            ? [{ scale: 0.96 }]
                            : [],
                      },
                    ]}
                    onPress={handleNameConfirm}
                    disabled={!newListName.trim()}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: newListName.trim() ? "#008CFF" : "#bfbfbf",
                      }}
                    >
                      Create
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
