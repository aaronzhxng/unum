import React, { useEffect } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { notificationPreferences } from "../../utils/notificationPreferences";
import { styles } from "../styles"; // Adjust path as needed

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNotifications: string[];
  setSelectedNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  itemId: string;
  itemType: "bill" | "official";
}

const listOptions = [
  { id: "all-notications", label: "All" },
  { id: "bills-voted", label: "Bills voted on" },
  { id: "bills-cosponsored", label: "Bills cosponsored" },
  { id: "bills-introduced", label: "Bills introduced" },
  { id: "elections", label: "Elections" },
];

export default function OptionsModal({
  showOptionsModal,
  setShowOptionsModal,
  selectedNotifications,
  setSelectedNotifications,
  itemId,
  itemType,
}: Props) {
  const closeModal = () => setShowOptionsModal(false);

  const toggleList = (id: string) => {
    if (id === "all-notications") {
      if (selectedNotifications.includes("all-notications")) {
        setSelectedNotifications([]);
      } else {
        setSelectedNotifications(listOptions.map((o) => o.id));
      }
    } else {
      setSelectedNotifications((prev) => {
        const next = prev.includes(id)
          ? prev.filter((item) => item !== id && item !== "all-notications")
          : [...prev.filter((item) => item !== "all-notications"), id];
        // Auto-select "all" if every non-all option is checked
        const nonAllOptions = listOptions.filter(
          (o) => o.id !== "all-notications",
        );
        if (nonAllOptions.every((o) => next.includes(o.id))) {
          return [...next, "all-notications"];
        }
        return next;
      });
    }
  };

  const handleApply = () => {
    notificationPreferences.saveSubTypes(
      itemId,
      itemType,
      selectedNotifications,
    );
    closeModal();
  };

  useEffect(() => {
    if (showOptionsModal) {
      const saved = notificationPreferences.getSubTypes(itemId);
      setSelectedNotifications(saved);
    }
  }, [showOptionsModal, itemId]);

  return showOptionsModal ? (
    <Modal
      visible={showOptionsModal}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={closeModal}
    >
      <Pressable style={styles.modalOverlay} onPress={closeModal}>
        <View style={{ padding: 0, minHeight: 400, marginTop: -60 }}>
          <ScrollView
            style={styles.dropdownAdd}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.dropdownItemTextLabel}>
              Select Notifications
            </Text>
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
                    borderColor: selectedNotifications.includes(option.id)
                      ? "#008CFF"
                      : "#ccc",
                    borderRadius: 4,
                    backgroundColor: selectedNotifications.includes(option.id)
                      ? "#008CFF"
                      : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedNotifications.includes(option.id) && (
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
            <Pressable
              style={({ pressed }) => [
                styles.dropdownItem, // base
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopWidth: 1,
                  borderColor: "#ccc",
                  paddingTop: 12,
                  marginTop: 12,
                },
                pressed && styles.dropdownItemPressed,
              ]}
            >
              <Text style={[styles.dropdownItemText, { color: "#FF3B30" }]}>
                Report an Error
              </Text>
            </Pressable>
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
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  ) : null;
}
