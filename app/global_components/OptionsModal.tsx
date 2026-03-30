import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles as componentStyles } from "../global_styles/styles";
import { notificationPreferences } from "../utils/notificationPreferences";
import { storage } from "../utils/storage"; // adjust relative path if needed

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNotifications: string;
  setSelectedNotifications: React.Dispatch<React.SetStateAction<string>>;
  selectedListId: string;
  refreshLists: () => Promise<void>;
  setSelectedList: React.Dispatch<React.SetStateAction<string>>;
  onNotifVersionChange?: () => void;
}

export default function OptionsModal({
  showOptionsModal,
  setShowOptionsModal,
  selectedNotifications,
  setSelectedNotifications,
  selectedListId,
  refreshLists,
  setSelectedList,
  onNotifVersionChange,
}: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (showOptionsModal && selectedListId) {
      const enabled = notificationPreferences.isEnabled(
        `list_${selectedListId}`,
      );
      setNotificationsEnabled(enabled);
    }
  }, [showOptionsModal, selectedListId]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameValue, setRenameValue] = useState("New List");

  const handleToggleNotifications = () => {
    const newState = notificationPreferences.toggle(
      `list_${selectedListId}`,
      "list",
    );
    setNotificationsEnabled(newState);
    onNotifVersionChange?.();
  };

  const handleRenameConfirm = async () => {
    if (!selectedListId || !renameValue.trim()) return;

    const allLists = await storage.getLists();
    const updatedLists = allLists.map((list) =>
      list.id === selectedListId ? { ...list, name: renameValue.trim() } : list,
    );
    await storage.saveLists(updatedLists);
    setSelectedList(renameValue.trim()); // ADD THIS
    setShowRenameModal(false);
    await refreshLists();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedListId) return;
    await storage.deleteList(selectedListId);
    setSelectedNotifications("Deleted");
    setShowDeleteModal(false);
    await refreshLists();
  };

  return (
    <>
      {/* Main Options Dropdown */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={componentStyles.modalOverlay}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={componentStyles.dropdown}>
            {/* Rename */}
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={() => {
                setShowOptionsModal(false);
                setTimeout(() => setShowRenameModal(true), 200);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>Rename</Text>
            </Pressable>

            {/* Delete List */}
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={() => {
                setShowOptionsModal(false);
                setTimeout(() => setShowDeleteModal(true), 200);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>Delete List</Text>
            </Pressable>

            {/* Notifications with checkbox */}
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={handleToggleNotifications}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={componentStyles.dropdownItemText}>
                  Notifications for this List
                </Text>
                <Bell
                  size={16}
                  color={notificationsEnabled ? "#008CFF" : "#535353"}
                />
              </View>
            </Pressable>
          </View>

          {/* Tips & Resources — separate card */}
          <View style={[componentStyles.dropdown, { marginTop: 12 }]}>
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={() => {
                setShowOptionsModal(false);
                router.push("/tips" as any);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>
                Tips & Resources
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Rename Confirmation Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable
            style={componentStyles.modalOverlay}
            onPress={() => setShowRenameModal(false)}
          >
            <Pressable onPress={() => {}} style={componentStyles.subModalCard}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: 16,
                }}
              >
                Rename List
              </Text>

              {/* Text Input */}
              <TextInput
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#535353",
                  fontSize: 15,
                  color: "#1a1a1a",
                  paddingVertical: 6,
                  marginBottom: 4,
                }}
                value={renameValue}
                onChangeText={setRenameValue}
                autoFocus
                selectTextOnFocus
                placeholderTextColor="#adb5bd"
              />

              {/* Action Buttons */}
              <View style={componentStyles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    componentStyles.actionButton,
                    { transform: pressed ? [{ scale: 0.96 }] : [] },
                    // { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setShowRenameModal(false)}
                >
                  <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
                </Pressable>

                <View style={componentStyles.verticalDivider} />

                <Pressable
                  style={({ pressed }) => [
                    componentStyles.actionButton,
                    { transform: pressed ? [{ scale: 0.96 }] : [] },
                    // { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={handleRenameConfirm}
                >
                  <Text style={{ fontSize: 16, color: "#535353" }}>Rename</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={componentStyles.modalOverlay}
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable onPress={() => {}} style={componentStyles.subModalCard}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#000000",
                marginBottom: 8,
              }}
            >
              Delete
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#7B7C81",
                marginBottom: 4,
              }}
            >
              This list will be permanently deleted.
            </Text>

            {/* Action Buttons */}
            <View style={componentStyles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  componentStyles.actionButton,
                  { transform: pressed ? [{ scale: 0.96 }] : [] },
                  // { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
              </Pressable>

              <View style={componentStyles.verticalDivider} />

              <Pressable
                style={({ pressed }) => [
                  componentStyles.actionButton,
                  { transform: pressed ? [{ scale: 0.96 }] : [] },
                  // { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleDeleteConfirm}
              >
                <Text
                  style={{ fontSize: 16, color: "#FF3B30", fontWeight: 600 }}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
