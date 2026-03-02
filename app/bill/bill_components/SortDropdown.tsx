import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles";

interface Props {
  showSortDropdown: boolean;
  setShowSortDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSort: string;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
  dropdownType?: "amendments" | "actions" | "cosponsors"; // NEW: Controls options
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
    amendments: [
      "Most Viewed",
      "Most Recent Action",
      "Newest First",
      "Oldest First",
    ],
    actions: ["Most Recent Action", "Oldest First"],
    cosponsors: ["A-Z", "Z-A", "Newest First", "Oldest First"], // Only these for cosponsors
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
