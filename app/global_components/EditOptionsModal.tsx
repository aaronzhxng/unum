import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface EditOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (action: "copy" | "move", lists: string[]) => void;
}

const AVAILABLE_LISTS = [
  "My List",
  "Tri State Area",
  "Swing States",
  "New List",
];

export default function EditOptionsModal({
  visible,
  onClose,
  onConfirm,
}: EditOptionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<"copy" | "move" | null>(
    null,
  );
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  const isListSectionEnabled = selectedAction !== null;

  const toggleList = (list: string) => {
    if (!isListSectionEnabled) return;
    setSelectedLists((prev) =>
      prev.includes(list) ? prev.filter((l) => l !== list) : [...prev, list],
    );
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setSelectedLists([]);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedAction || selectedLists.length === 0) return;
    onConfirm(selectedAction, selectedLists);
    setSelectedAction(null);
    setSelectedLists([]);
    onClose();
  };

  const canConfirm = selectedAction !== null && selectedLists.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <Pressable style={componentStyles.modalOverlay} onPress={handleCancel}>
        <Pressable
          onPress={() => {}}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {/* Section 1: Action Radio Buttons */}
          <View style={[componentStyles.dropdownMulti, { marginTop: 0 }]}>
            {/* Copy to List */}
            <Pressable
              style={[
                componentStyles.dropdownItem,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
              onPress={() => setSelectedAction("copy")}
            >
              <Text style={componentStyles.dropdownItemText}>Copy to List</Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor:
                    selectedAction === "copy" ? "#008CFF" : "#7B7C81",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {selectedAction === "copy" && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#008CFF",
                    }}
                  />
                )}
              </View>
            </Pressable>

            {/* Move to List */}
            <Pressable
              style={[
                componentStyles.dropdownItem,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
              onPress={() => setSelectedAction("move")}
            >
              <Text style={componentStyles.dropdownItemText}>Move to List</Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor:
                    selectedAction === "move" ? "#008CFF" : "#7B7C81",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {selectedAction === "move" && (
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#008CFF",
                    }}
                  />
                )}
              </View>
            </Pressable>
          </View>

          {/* Section 2: List Checkboxes (grayed out until action selected) */}
          <View
            style={[
              componentStyles.dropdownMulti,
              {
                marginTop: 12,
                opacity: isListSectionEnabled ? 1 : 0.6,
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: 220 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {AVAILABLE_LISTS.map((list) => (
                <Pressable
                  key={list}
                  style={[
                    componentStyles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => toggleList(list)}
                >
                  <Text
                    style={[
                      componentStyles.dropdownItemText,
                      list === "New List" && { color: "#7B7C81" }, // 👈 gray for New List
                    ]}
                  >
                    {list}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor:
                        isListSectionEnabled && selectedLists.includes(list)
                          ? "#008CFF"
                          : "#7B7C81",
                      borderRadius: 4,
                      backgroundColor:
                        isListSectionEnabled && selectedLists.includes(list)
                          ? "#008CFF"
                          : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isListSectionEnabled && selectedLists.includes(list) && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#008CFF",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Cancel / Confirm Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginHorizontal: 16,
              marginTop: 4,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                componentStyles.actionButton,
                { backgroundColor: "#fafafa", flex: 1 },
                { transform: pressed ? [{ scale: 0.96 }] : [] },
              ]}
              onPress={handleCancel}
            >
              <Text
                style={{ color: "#535353", fontWeight: "500", fontSize: 16 }}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                componentStyles.actionButton,
                {
                  backgroundColor: canConfirm ? "#00AFFF" : "#bfbfbf",
                  flex: 1,
                },
                { transform: pressed && canConfirm ? [{ scale: 0.96 }] : [] },
              ]}
              onPress={handleConfirm}
              disabled={!canConfirm}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}
              >
                Confirm
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
