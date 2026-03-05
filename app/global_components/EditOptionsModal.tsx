import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface EditOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (action: "copy" | "move", listIds: string[]) => void;
  onNewListPress: (action: "copy" | "move") => void; // ← add action param
  availableLists: Array<{ id: string; name: string }>;
}

export default function EditOptionsModal({
  visible,
  onClose,
  onConfirm,
  onNewListPress,
  availableLists,
}: EditOptionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<"copy" | "move" | null>(
    null,
  );
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentListIndex, setCurrentListIndex] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedAction(null);
      setSelectedListIds([]);
    }
  }, [visible]);

  const isListSectionEnabled = selectedAction !== null;

  // The real lists selected (excludes "new list" placeholder)
  const selectedRealListIds = selectedListIds.filter((id) => id !== "__new__");
  const hasNewList = selectedListIds.includes("__new__");

  const toggleList = (id: string) => {
    if (!isListSectionEnabled) return;
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setSelectedListIds([]);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedAction || selectedListIds.length === 0) return;

    if (hasNewList && selectedRealListIds.length === 0) {
      onClose();
      const action = selectedAction;
      setSelectedAction(null);
      setSelectedListIds([]);
      setTimeout(() => onNewListPress(action), 200);
      return;
    }

    onClose();
    setShowProgressModal(true);
    setProgress(0);
    setCurrentListIndex(0);
  };

  useEffect(() => {
    if (!showProgressModal) return;

    const totalLists = selectedRealListIds.length;
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

          if (selectedAction) {
            onConfirm(selectedAction, selectedRealListIds);
          }

          const shouldOpenNewList = hasNewList;
          const savedAction = selectedAction; // capture before clearing
          setSelectedAction(null);
          setSelectedListIds([]);

          if (shouldOpenNewList) {
            setTimeout(() => onNewListPress(savedAction!), 200);
          }
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [showProgressModal]);

  const canConfirm = selectedAction !== null && selectedListIds.length > 0;

  const currentListName =
    availableLists.find((l) => l.id === selectedRealListIds[currentListIndex])
      ?.name ?? "";

  return (
    <>
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
            {/* Action Radio Buttons */}
            <View style={[componentStyles.dropdownMulti, { marginTop: 0 }]}>
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

            {/* List Checkboxes */}
            <View
              style={[
                componentStyles.dropdownMulti,
                { marginTop: 12, opacity: isListSectionEnabled ? 1 : 0.6 },
              ]}
            >
              <ScrollView
                style={{ maxHeight: 220 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {availableLists.map((list) => (
                  <Pressable
                    key={list.id}
                    style={[
                      componentStyles.dropdownItem,
                      {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => toggleList(list.id)}
                  >
                    <Text style={componentStyles.dropdownItemText}>
                      {list.name}
                    </Text>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderWidth: 2,
                        borderColor:
                          isListSectionEnabled &&
                          selectedListIds.includes(list.id)
                            ? "#008CFF"
                            : "#7B7C81",
                        borderRadius: 4,
                        backgroundColor:
                          isListSectionEnabled &&
                          selectedListIds.includes(list.id)
                            ? "#008CFF"
                            : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isListSectionEnabled &&
                        selectedListIds.includes(list.id) && (
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

                {/* New List option */}
                <Pressable
                  style={[
                    componentStyles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => toggleList("__new__")}
                >
                  <Text
                    style={[
                      componentStyles.dropdownItemText,
                      { color: "#7B7C81" },
                    ]}
                  >
                    New List
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor:
                        isListSectionEnabled &&
                        selectedListIds.includes("__new__")
                          ? "#008CFF"
                          : "#7B7C81",
                      borderRadius: 4,
                      backgroundColor:
                        isListSectionEnabled &&
                        selectedListIds.includes("__new__")
                          ? "#008CFF"
                          : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {isListSectionEnabled &&
                      selectedListIds.includes("__new__") && (
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
              </ScrollView>
            </View>

            {/* Cancel / Confirm */}
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
              {currentListName}
            </Text>
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {currentListIndex + 1}/{selectedRealListIds.length}
              </Text>
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {Math.round(progress)}%
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setShowProgressModal(false);
                setProgress(0);
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
