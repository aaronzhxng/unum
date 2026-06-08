import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import ReportErrorModal from "../global_components/ReportErrorModal";
import { styles as componentStyles } from "../global_styles/styles";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Passed through to ReportErrorModal so we know which screen the report came from. */
  screen: string;
}

/**
 * Small two-item dropdown that appears near the top-right three-dot button
 * on education screens: Glossary and Report an Error.
 */
export default function EducationOptionsMenu({ visible, onClose, screen }: Props) {
  const router = useRouter();
  const [showReport, setShowReport] = useState(false);

  if (!visible && !showReport) return null;

  return (
    <>
      {visible && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={onClose}
          statusBarTranslucent
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.15)",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              paddingTop: 72,
              paddingRight: 8,
            }}
            onPress={onClose}
          >
            {/* Card — stop touches from reaching the overlay */}
            <Pressable onPress={() => {}}>
              <View style={componentStyles.dropdown}>
                <Pressable
                  style={({ pressed }) =>
                    pressed
                      ? componentStyles.dropdownItemPressed
                      : componentStyles.dropdownItem
                  }
                  onPress={() => {
                    onClose();
                    router.push("/glossary" as any);
                  }}
                >
                  <Text style={componentStyles.dropdownItemText}>Glossary</Text>
                </Pressable>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#e0e0e0",
                    marginHorizontal: 16,
                  }}
                />

                <Pressable
                  style={({ pressed }) =>
                    pressed
                      ? componentStyles.dropdownItemPressed
                      : componentStyles.dropdownItem
                  }
                  onPress={() => {
                    onClose();
                    setTimeout(() => setShowReport(true), 300);
                  }}
                >
                  <Text
                    style={[
                      componentStyles.dropdownItemText,
                      { color: "#FF3B30" },
                    ]}
                  >
                    Report an Error
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      <ReportErrorModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        screen={screen}
      />
    </>
  );
}
