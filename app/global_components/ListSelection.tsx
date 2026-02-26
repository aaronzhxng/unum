import { Check } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../global_styles/styles";

interface ListSelectionProps {
  showListSelection: boolean;
  setShowListSelection: (show: boolean) => void;
  selectedList: string;
  setSelectedList: (list: string) => void;
  lists: Array<{ id: string; name: string }>;
  onNewListPress: () => void;
}

export default function ListSelection({
  showListSelection,
  setShowListSelection,
  selectedList,
  setSelectedList,
  lists,
  onNewListPress,
}: ListSelectionProps) {
  const handleListSelect = (listName: string) => {
    setSelectedList(listName);
    setShowListSelection(false);
  };

  const handleNewList = () => {
    setShowListSelection(false);
    onNewListPress();
  };

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
          {/* Dynamic lists from storage */}
          {lists.map((list) => (
            <Pressable
              key={list.id}
              style={({ pressed }) =>
                pressed ? styles.dropdownItemPressed : styles.dropdownItem
              }
              onPress={() => handleListSelect(list.name)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.dropdownItemText}>{list.name}</Text>
                {selectedList === list.name && (
                  <Check size={20} color="#008CFF" strokeWidth={4} />
                )}
              </View>
            </Pressable>
          ))}

          {/* New List option */}
          <Pressable
            style={({ pressed }) =>
              pressed ? styles.dropdownItemPressed : styles.dropdownItem
            }
            onPress={handleNewList}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[styles.dropdownItemText, { color: "#7B7C81" }]}>
                New List
              </Text>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
