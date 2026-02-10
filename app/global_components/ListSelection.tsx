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
              setSelectedList("My List");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>My List</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("Tri State Area");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Tri State Area</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("Swing States");
              setShowListSelection(false);
            }}
          >
            <Text style={styles.dropdownItemText}>Swing States</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={() => {
              setSelectedList("New List");
              setShowListSelection(false);
            }}
          >
            <Text style={[styles.dropdownItemText, { color: "#7B7C81" }]}>
              New List
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
