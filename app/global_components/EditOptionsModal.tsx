import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface EditOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (action: "copy" | "move", lists: string[]) => void;
  onNewListPress: () => void;
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
  onNewListPress,
}: EditOptionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<"copy" | "move" | null>(
    null,
  );
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentListIndex, setCurrentListIndex] = useState(0);

  const isListSectionEnabled = selectedAction !== null;

  // Filter out "New List" for progress display
  const progressLists = selectedLists.filter((list) => list !== "New List");

  const toggleList = (list: string) => {
    if (!isListSectionEnabled) return;

    // Just toggle - don't open modal immediately
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

    const hasNewList = selectedLists.includes("New List");
    const hasOtherLists = progressLists.length > 0;

    // If ONLY "New List" is selected, open modal immediately
    if (hasNewList && !hasOtherLists) {
      onClose();
      setSelectedAction(null);
      setSelectedLists([]);
      setTimeout(() => onNewListPress(), 200);
      return;
    }

    // Otherwise show progress for other lists first
    onClose();
    setShowProgressModal(true);
    setProgress(0);
    setCurrentListIndex(0);
  };

  // Animate progress bar
  useEffect(() => {
    if (!showProgressModal) return;

    const totalLists = progressLists.length;
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
        setTimeout(() => {
          setShowProgressModal(false);
          setProgress(0);
          setCurrentListIndex(0);

          // Call onConfirm with only the regular lists (not "New List")
          if (selectedAction) {
            onConfirm(selectedAction, progressLists);
          }

          const hasNewList = selectedLists.includes("New List");
          setSelectedAction(null);
          setSelectedLists([]);

          // If "New List" was selected, open the name modal now
          if (hasNewList) {
            setTimeout(() => onNewListPress(), 200);
          }
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [showProgressModal, progressLists.length]);

  const canConfirm = selectedAction !== null && selectedLists.length > 0;

  return (
    <>
      {/* Main Selection Modal */}
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
                <Text style={componentStyles.dropdownItemText}>
                  Copy to List
                </Text>
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
                <Text style={componentStyles.dropdownItemText}>
                  Move to List
                </Text>
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

            {/* Section 2: List Checkboxes */}
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
                        list === "New List" && { color: "#7B7C81" },
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
                            borderRadius: 2,
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

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
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
              {selectedAction === "copy" ? "Copying to" : "Moving to"}{" "}
              {progressLists[currentListIndex]}
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
                marginBottom: 0,
              }}
            >
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {currentListIndex + 1}/{progressLists.length}
              </Text>
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {Math.round(progress)}%
              </Text>
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={() => {
                setShowProgressModal(false);
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
