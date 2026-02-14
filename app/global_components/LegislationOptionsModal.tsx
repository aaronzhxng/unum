import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  onReportError: () => void;
}

export default function LegislationOptionsModal({
  showOptionsModal,
  setShowOptionsModal,
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
