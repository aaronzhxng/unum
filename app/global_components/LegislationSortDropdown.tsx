import React from "react"; // ✅ 1. ADD React
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from "react-native"; // ✅ 2. ADD Text
import { styles as componentStyles } from "../global_styles/styles"; // ✅ 3. ADD styles

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHORT_SCREEN = SCREEN_HEIGHT < 750;

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
          <ScrollView
            scrollEnabled={false}
            style={{ maxHeight: SCREEN_HEIGHT * 0.35 }}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              style={({ pressed }) => [
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem,
                { paddingVertical: SHORT_SCREEN ? 12 : 16 },
              ]}
              onPress={() => {
                setSelectedSort("Recent Action");
                setShowSortDropdown(false);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>Recent Action</Text>
            </Pressable>
            {/* <Pressable
              style={({ pressed }) => [
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem,
                { paddingVertical: SHORT_SCREEN ? 12 : 16 },
              ]}
              onPress={() => {
                setSelectedSort("Most Popular");
                setShowSortDropdown(false);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>Most Popular</Text>
            </Pressable> */}
            {/* <Pressable
              style={({ pressed }) => [
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem,
                { paddingVertical: SHORT_SCREEN ? 12 : 16 },
              ]}
              onPress={() => {
                setSelectedSort("Newest First");
                setShowSortDropdown(false);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>Newest First</Text>
            </Pressable> */}
            <Pressable
              style={({ pressed }) => [
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem,
                { paddingVertical: SHORT_SCREEN ? 12 : 16 },
              ]}
              onPress={() => {
                setSelectedSort("Oldest First");
                setShowSortDropdown(false);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>Oldest First</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
