import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNotifications: string;
  setSelectedNotifications: React.Dispatch<React.SetStateAction<string>>;
}

export default function OptionsModal({
  showOptionsModal,
  setShowOptionsModal,
  selectedNotifications,
  setSelectedNotifications,
}: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameValue, setRenameValue] = useState("New List");

  const handleToggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    setSelectedNotifications("Notifications for this List");
  };

  const handleRenameConfirm = () => {
    setSelectedNotifications(renameValue);
    setShowRenameModal(false);
  };

  const handleDeleteConfirm = () => {
    setSelectedNotifications("Deleted");
    setShowDeleteModal(false);
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
            <Pressable style={componentStyles.dropdownItem}>
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
                <Pressable
                  style={({ pressed }) => ({
                    padding: 4,
                    borderRadius: 4,
                  })}
                  onPress={handleToggleNotifications}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: notificationsEnabled
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {notificationsEnabled && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#008CFF",
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              </View>
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

              {/* <View style={componentStyles.divider} /> */}

              {/* Action Buttons */}
              <View style={componentStyles.actionRow}>
                <TouchableOpacity
                  style={componentStyles.actionButton}
                  onPress={() => setShowRenameModal(false)}
                >
                  <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
                </TouchableOpacity>

                <View style={componentStyles.verticalDivider} />

                <TouchableOpacity
                  style={componentStyles.actionButton}
                  onPress={handleRenameConfirm}
                >
                  <Text style={{ fontSize: 16, color: "#535353" }}>Rename</Text>
                </TouchableOpacity>
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
                color: "#1a1a1a",
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
              This List will be permanently deleted.
            </Text>

            {/* <View style={componentStyles.divider} /> */}

            {/* Action Buttons */}
            <View style={componentStyles.actionRow}>
              <TouchableOpacity
                style={componentStyles.actionButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
              </TouchableOpacity>

              <View style={componentStyles.verticalDivider} />

              <TouchableOpacity
                style={componentStyles.actionButton}
                onPress={handleDeleteConfirm}
              >
                <Text style={{ fontSize: 16, color: "#535353" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
