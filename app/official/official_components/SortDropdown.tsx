import React from "react"; // ✅ 1. ADD React
import { Modal, Pressable, Text, View } from "react-native"; // ✅ 2. ADD Text
import { styles } from "../styles"; // ✅ 3. ADD styles

interface Props {
  // ✅ 4. ADD Props interface
  showSortDropdown: boolean;
  setShowSortDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSort: string;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
}

export default function SortDropdown({
  // ✅ 5. WRAP in function + destructure
  showSortDropdown,
  setShowSortDropdown,
  selectedSort,
  setSelectedSort,
}: Props) {
  return (
    <Modal // ✅ 6. Remove {showSortDropdown && ( since Modal visible= handles it
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
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Most Viewed");
              setShowSortDropdown(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Most Viewed</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Most Recent Action");
              setShowSortDropdown(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Most Recent Action</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Newest First");
              setShowSortDropdown(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Newest First</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Oldest First");
              setShowSortDropdown(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Oldest First</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
