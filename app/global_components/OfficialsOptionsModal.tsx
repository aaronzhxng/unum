import { Bell, BellOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";
import { notificationPreferences } from "../utils/notificationPreferences";

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSetPriority: () => void;
  onReportError: () => void;
  selectedState: string;
  onNotifVersionChange?: () => void;
}

export default function OfficialsOptionsModal({
  showOptionsModal,
  setShowOptionsModal,
  onSetPriority,
  onReportError,
  selectedState,
  onNotifVersionChange,
}: Props) {
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (showOptionsModal && selectedState && selectedState !== "All States") {
      const enabled = notificationPreferences.isEnabled(
        `state_${selectedState}`,
      );
      setNotifEnabled(enabled);
    }
  }, [showOptionsModal, selectedState]);

  const handleToggleNotif = () => {
    if (selectedState === "All States") return;
    const newState = notificationPreferences.toggle(
      `state_${selectedState}`,
      "official",
    );
    setNotifEnabled(newState);
    onNotifVersionChange?.();
  };

  return (
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
          {/* Notifications for this State */}
          {selectedState !== "All States" && (
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={handleToggleNotif}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={componentStyles.dropdownItemText}>
                  Notifications for {selectedState}
                </Text>
                {notifEnabled ? (
                  <Bell size={16} color="#008CFF" />
                ) : (
                  <BellOff size={16} color="#535353" />
                )}
              </View>
            </Pressable>
          )}

          {/* Set as Priority State */}
          {selectedState !== "All States" && (
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={() => {
                onSetPriority();
                setShowOptionsModal(false);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>
                Set as Priority State
              </Text>
            </Pressable>
          )}

          {/* Report an Error */}
          <Pressable
            style={({ pressed }) =>
              pressed
                ? componentStyles.dropdownItemPressed
                : componentStyles.dropdownItem
            }
            onPress={() => {
              onReportError();
              setShowOptionsModal(false);
            }}
          >
            <Text
              style={[componentStyles.dropdownItemText, { color: "#FF3B30" }]}
            >
              Report an Error
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
