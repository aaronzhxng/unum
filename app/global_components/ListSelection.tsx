import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../global_styles/styles";

interface Props {
  // ✅ 4. ADD Props interface
  showListSelection: boolean;
  setShowListSelection: React.Dispatch<React.SetStateAction<boolean>>;
  selectedList: string;
  setSelectedList: React.Dispatch<React.SetStateAction<string>>;
}

export default function ListSelection({
  showListSelection,
  setShowListSelection,
  selectedList,
  setSelectedList,
}: Props) {
  return (
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
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("Most Viewed");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Most Viewed</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("Most Recent Action");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Most Recent Action</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("Newest First");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Newest First</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("Oldest First");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Oldest First</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
