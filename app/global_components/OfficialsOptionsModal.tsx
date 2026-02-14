import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSetPriority: () => void;
  onReportError: () => void;
}

export default function OfficialsOptionsModal({
  showOptionsModal,
  setShowOptionsModal,
  onSetPriority,
  onReportError,
}: Props) {
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
          {/* Set as Priority State */}
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
