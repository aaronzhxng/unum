import { Bell, Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../global_styles/styles";
import { notificationPreferences } from "../utils/notificationPreferences";

interface ListSelectionProps {
  showListSelection: boolean;
  setShowListSelection: (show: boolean) => void;
  selectedList: string;
  setSelectedList: (list: string) => void;
  lists: Array<{ id: string; name: string }>;
  onNewListPress: () => void;
  notifVersion?: number;
}

export default function ListSelection({
  showListSelection,
  setShowListSelection,
  selectedList,
  setSelectedList,
  lists,
  onNewListPress,
  notifVersion,
}: ListSelectionProps) {
  const handleListSelect = (listName: string) => {
    setSelectedList(listName);
    setShowListSelection(false);
  };

  const handleNewList = () => {
    setShowListSelection(false);
    onNewListPress();
  };

  const [enabledListNotifs, setEnabledListNotifs] = useState<Set<string>>(
    new Set(
      lists
        .filter((l) => notificationPreferences.isEnabled(`list_${l.id}`))
        .map((l) => l.id),
    ),
  );

  useEffect(() => {
    setEnabledListNotifs(
      new Set(
        lists
          .filter((l) => notificationPreferences.isEnabled(`list_${l.id}`))
          .map((l) => l.id),
      ),
    );
  }, [notifVersion, lists]);

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
          {lists.map((list) => {
            const listNotifEnabled = enabledListNotifs.has(list.id);
            return (
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{list.name}</Text>
                    {listNotifEnabled && (
                      <Bell
                        size={14}
                        style={{ marginTop: 4 }}
                        color="#008CFF"
                      />
                    )}
                  </View>
                  {selectedList === list.name && (
                    <Check size={20} color="#008CFF" strokeWidth={4} />
                  )}
                </View>
              </Pressable>
            );
          })}

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
