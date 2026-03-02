import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  showSortDropdown: boolean;
  setShowSortDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSort: string;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
  dropdownType?: "amendments" | "actions" | "cosponsors" | "sponsored";
}

export default function SortDropdown({
  showSortDropdown,
  setShowSortDropdown,
  selectedSort,
  setSelectedSort,
  dropdownType = "amendments", // NEW: Default to amendments
}: Props) {
  // NEW: Dynamic options per type
  const options = {
    amendments: ["Newest First", "Oldest First"],
    actions: ["Newest First", "Oldest First"],
    cosponsors: ["Oldest First", "Newest First", "A-Z", "Z-A"],
    sponsored: [
      "Most Viewed",
      "Most Recent Action",
      "Newest First",
      "Oldest First",
    ],
  };

  return (
    <Modal
      visible={showSortDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortDropdown(false)}
      statusBarTranslucent={true}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowSortDropdown(false)}
      >
        <View style={styles.dropdown}>
          {options[dropdownType].map(
            (
              option, // NEW: Dynamic rendering
            ) => (
              <Pressable
                key={option}
                style={({ pressed }) =>
                  pressed ? styles.dropdownItemPressed : styles.dropdownItem
                }
                onPress={() => {
                  setSelectedSort(option);
                  setShowSortDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{option}</Text>
              </Pressable>
            ),
          )}
        </View>
      </Pressable>
    </Modal>
  );
}
