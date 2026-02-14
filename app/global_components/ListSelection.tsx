import { Check } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../global_styles/styles";

interface Props {
  showListSelection: boolean;
  setShowListSelection: React.Dispatch<React.SetStateAction<boolean>>;
  selectedList: string;
  setSelectedList: React.Dispatch<React.SetStateAction<string>>;
}

const LIST_OPTIONS = [
  { id: "my-list", label: "My List" },
  { id: "tri-state", label: "Tri State Area" },
  { id: "swing-states", label: "Swing States" },
  { id: "new-list", label: "New List", isNew: true },
];

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
          {LIST_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) =>
                pressed ? styles.dropdownItemPressed : styles.dropdownItem
              }
              onPress={() => {
                setSelectedList(option.label);
                setShowListSelection(false);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    option.isNew && { color: "#7B7C81" },
                  ]}
                >
                  {option.label}
                </Text>
                {selectedList === option.label && (
                  <Check size={20} color="#008CFF" strokeWidth={4} />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
