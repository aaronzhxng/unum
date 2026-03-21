import { Bell, Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
        style={{ flex: 1 }}
        onPress={() => setShowListSelection(false)}
      >
        <View
          style={{
            position: "absolute",
            top: 100,
            left: 16,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 4,
            minWidth: 200,
            maxWidth: 280,
            maxHeight: 360,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {lists.map((list) => {
              const listNotifEnabled = enabledListNotifs.has(list.id);
              return (
                <Pressable
                  key={list.id}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    opacity: pressed ? 0.7 : 1,
                  })}
                  onPress={() => handleListSelect(list.name)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        flex: 1,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 15,
                          fontWeight:
                            selectedList === list.name ? "700" : "400",
                          color: "#1a1a1a",
                          flex: 1,
                        }}
                      >
                        {list.name}
                      </Text>
                      {listNotifEnabled && <Bell size={14} color="#008CFF" />}
                    </View>
                    {selectedList === list.name && (
                      <Check size={20} color="#008CFF" strokeWidth={4} />
                    )}
                  </View>
                </Pressable>
              );
            })}

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginHorizontal: 12,
              }}
            />

            {/* New List */}
            <Pressable
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={handleNewList}
            >
              <Text style={{ fontSize: 15, color: "#7B7C81" }}>New List</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
