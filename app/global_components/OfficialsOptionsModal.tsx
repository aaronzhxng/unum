import { useRouter } from "expo-router";
import { Bell, BellOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";
import { notificationPreferences } from "../utils/notificationPreferences";
import { syncPreferencesToBackend } from "../utils/syncPreferences";

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
  const router = useRouter();

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
    syncPreferencesToBackend();
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
        {/* First dropdown — state-specific actions */}
        {selectedState !== "All States" && (
          <View style={[componentStyles.dropdown, { marginBottom: 12 }]}>
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
          </View>
        )}

        {/* Second dropdown — Tips & Report */}
        <View style={componentStyles.dropdown}>
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
