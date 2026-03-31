import React from "react"; // ✅ 1. ADD React
import { Modal, Pressable, Text, View } from "react-native"; // ✅ 2. ADD Text
import { styles as componentStyles } from "../global_styles/styles"; // ✅ 3. ADD styles

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
        style={componentStyles.modalOverlay}
        onPress={() => setShowSortDropdown(false)}
      >
        <View style={componentStyles.dropdown}>
          <Pressable
            style={({ pressed }) =>
              pressed
                ? componentStyles.dropdownItemPressed
                : componentStyles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Most Active");
              setShowSortDropdown(false);
            }}
          >
            <Text style={componentStyles.dropdownItemText}>Most Active</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed
                ? componentStyles.dropdownItemPressed
                : componentStyles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Recent Action");
              setShowSortDropdown(false);
            }}
          >
            <Text style={componentStyles.dropdownItemText}>Recent Action</Text>
          </Pressable>
          {/* <Pressable
            style={({ pressed }) =>
              pressed
                ? componentStyles.dropdownItemPressed
                : componentStyles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Newest First");
              setShowSortDropdown(false);
            }}
          >
            <Text style={componentStyles.dropdownItemText}>Newest First</Text>
          </Pressable> */}
          <Pressable
            style={({ pressed }) =>
              pressed
                ? componentStyles.dropdownItemPressed
                : componentStyles.dropdownItem
            }
            onPress={() => {
              setSelectedSort("Oldest First");
              setShowSortDropdown(false);
            }}
          >
            <Text style={componentStyles.dropdownItemText}>Oldest First</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
